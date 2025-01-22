/*!
 * Copyright 2022 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as realFs from "node:fs";
import * as path from "node:path";
import { Host } from "./Host.js";

function assertNoTombstone(
  node: Node,
): asserts node is Node & { tombstone?: false } {
  if (node.tombstone) {
    throw new Error(`Unexpected tombstone ${JSON.stringify(node)}`);
  }
}

function assertNotType<N extends Node, T extends Node["type"]>(
  node: N,
  type: T,
): asserts node is N & { type: Exclude<N["type"], T> } {
  if (node.type === type) {
    throw new Error(`Unexpected node type ${JSON.stringify(node)}`);
  }
}

function assertType<N extends Node, T extends Node["type"]>(
  node: N,
  type: T,
): asserts node is N & { type: T } {
  if (node.type !== type) {
    throw new Error(`Unexpected node type ${JSON.stringify(node)}`);
  }
}

function assertExists<T extends Node>(node: T | undefined): asserts node is T {
  if (!node) {
    throw new Error(`Expected node to exist`);
  }
}

function assertHasParent(node: Node) {
  if (!node.parent) {
    throw new Error("Expected node to have a parent directory");
  }
}

interface BaseNode<T extends string> {
  type: T;
  fullPath: string;
  tombstone?: boolean;
  parent?: DirNode | DirStubNode;
  needsFlush: boolean;
}
interface DirNode extends BaseNode<"dir"> {
  stub?: false;
  tombstone?: false;
  dir: Map<string, Node>;
}

interface DirStubNode extends BaseNode<"dir"> {
  stub: true;
  tombstone?: false;
  dir: Map<string, Node>;
}

interface DirTombstoneNode extends BaseNode<"dir"> {
  stub?: false;
  tombstone: true;
  dir: Map<string, Node>;
}

interface FileNode extends BaseNode<"file"> {
  stub?: false;
  tombstone?: false;
  file: Buffer;
}

interface FileTombstoneNode extends BaseNode<"file"> {
  stub?: false;
  tombstone: true;
  file?: never;
}

interface FileStubNode extends BaseNode<"file"> {
  stub: true;
  tombstone?: false;
  file?: never;
}

interface SymlinkNode extends BaseNode<"symlink"> {
  tombstone?: false;
  symlink: string;
}

type Node =
  | DirNode
  | FileNode
  | SymlinkNode
  | DirTombstoneNode
  | FileTombstoneNode
  | DirStubNode
  | FileStubNode;

export class CachingHost implements Host {
  // We need many trees because of windows, key is the `root`
  #trees = new Map<string, DirNode | DirStubNode>();

  constructor(
    private fs: Pick<
      typeof realFs,
      | "existsSync"
      | "lstatSync"
      | "mkdirSync"
      | "promises"
      | "readdirSync"
      | "readFileSync"
      | "readlinkSync"
      | "realpathSync"
      | "rmdirSync"
      | "statSync"
      | "unlinkSync"
      | "writeFileSync"
    > = realFs,
  ) {}

  #replaceNode(
    node: FileNode | FileStubNode | SymlinkNode,
    newNode: Omit<FileTombstoneNode, "fullPath" | "parent">,
  ): FileTombstoneNode;
  #replaceNode(
    node: FileNode | FileStubNode | FileTombstoneNode,
    newNode: Omit<FileNode, "fullPath" | "parent">,
  ): FileNode;
  #replaceNode(
    node: DirTombstoneNode | DirStubNode,
    newNode: Omit<DirNode, "fullPath" | "parent" | "dir">,
  ): DirStubNode;
  #replaceNode(
    node: DirNode,
    newNode: Omit<DirTombstoneNode, "fullPath" | "parent" | "dir">,
  ): DirTombstoneNode;
  #replaceNode(
    node: Node,
    partialNewNode: Omit<Node, "fullPath" | "parent">,
  ): Node {
    if (!node.parent) throw new Error("Cannot replace root node");
    const newNode: Node = {
      ...partialNewNode,
      fullPath: node.fullPath,
      parent: node.parent,
      dir: (node as DirNode).dir,
    } as Node;
    node.parent.dir.set(path.basename(node.fullPath), newNode);
    return newNode;
  }

  #unstubDirectory(node: DirNode | DirStubNode): asserts node is DirNode {
    // So the rules for our stub dirs. We assume the things in the map are authority but
    // for things not in the map, the real FS is the authority
    for (const child of this.fs.readdirSync(node.fullPath)) {
      // just makign this call will populate the structure but its a little expensive.
      // TODO: make an unknown stub
      this.#getNode(path.join(node.fullPath, child));
    }
    node.stub = false;
  }

  /**
   * Assumes no parent -> path is root
   *
   * Throws if the path doesnt exist!
   */
  #stubify(filePath: string, parent: undefined): DirStubNode;
  #stubify(
    filePath: string,
    parent: DirNode | DirStubNode | undefined,
  ): DirStubNode | SymlinkNode | FileStubNode;
  #stubify(
    filePath: string,
    parent: DirNode | DirStubNode | undefined,
  ): typeof parent extends undefined ? DirNode | DirStubNode
    : DirNode | DirStubNode | SymlinkNode | FileStubNode
  {
    const canonicalPath = path.resolve(filePath);

    if (!parent && canonicalPath !== path.parse(canonicalPath).root) {
      throw new Error(
        `parent can only be null if path is root. Instead got: ${canonicalPath}`,
      );
    }
    const stat = this.fs.lstatSync(canonicalPath); // may throw

    let node: SymlinkNode | FileStubNode | DirStubNode;

    if (stat.isDirectory()) {
      node = {
        fullPath: canonicalPath,
        type: "dir",
        stub: true,
        dir: new Map(),
        parent,
        needsFlush: false,
      };
    } else if (stat.isSymbolicLink()) {
      node = {
        fullPath: canonicalPath,
        type: "symlink",
        symlink: this.fs.readlinkSync(canonicalPath),
        parent,
        needsFlush: false,
      };
    } else if (stat.isFile()) {
      node = {
        fullPath: canonicalPath,
        type: "file",
        stub: true,
        parent,
        needsFlush: false,
      };
    } else {
      throw new Error(
        `what is not a file nor symlink nor directory? nothing we care about: ${canonicalPath}`,
      );
    }

    if (!parent && node.type === "dir") {
      this.#trees.set(canonicalPath, node);
      return node;
    } else if (parent) {
      parent.dir.set(path.basename(canonicalPath), node);
    } else {
      throw new Error(
        `root can only be a dir, got ${
          JSON.stringify(node)
        } for path: ${canonicalPath}`,
      );
    }
    return node;
  }

  /**
   * Note: may return the node itself!
   * You should check the `fullPath` of the result.
   */
  #getNearestAncestorNode(filePath: string) {
    const canonicalPath = path.resolve(filePath);
    const { root } = path.parse(canonicalPath);
    const parts = [];

    let maybePath = canonicalPath;
    while (maybePath !== root) {
      parts.unshift(path.basename(maybePath));
      maybePath = path.dirname(maybePath);
    }

    let curPath = root;
    let curNode: Node = this.#trees.get(root)
      ?? this.#stubify(curPath, undefined); // its okay to throw if there is no root
    try {
      for (const part of parts) {
        assertNoTombstone(curNode);
        assertNotType(curNode, "file");
        if (curNode.type === "symlink") {
          const linkedNode = this.#getNodeResolvingSymlinks(
            path.resolve(path.dirname(curPath), curNode.symlink),
          );
          assertExists(linkedNode);
          assertNoTombstone(linkedNode);
          assertType(linkedNode, "dir");
          curNode = linkedNode;
        }
        assertType(curNode, "dir");
        assertNoTombstone(curNode);
        curNode = curNode.dir.get(part)
          ?? this.#stubify(path.join(curNode.fullPath, part), curNode);
        curPath = path.join(curPath, part);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // This error is expected when things done exist.
      // console.log(`Got EXPECTED error when trying to getNearestAncestorNode(${canonicalPath}): `, (e as any).message);
    }
    return { pathWithSymlinks: curPath, node: curNode };
  }

  #getNode(filePath: string) {
    const canonicalPath = path.resolve(filePath);
    const { pathWithSymlinks, node } = this.#getNearestAncestorNode(
      canonicalPath,
    );
    if (pathWithSymlinks === canonicalPath) {
      return node;
    }
    return undefined;
  }

  #getNodeResolvingSymlinks(
    filePath: string,
    follows: number = 100,
  ): Exclude<Node, SymlinkNode> | undefined {
    const node = this.#getNode(filePath); // canonicalizes for us
    if (!node || node.type !== "symlink") return node;
    // this is a really poor mans way of doing this. but who has 100's of symlinks hanging around?
    if (follows === 0) throw new Error("Exhausted symlink follows");

    return this.#getNodeResolvingSymlinks(node.symlink, follows--);
  }

  mkdir(
    filePath: string,
    opts: { recursive: boolean } = { recursive: false },
  ): void {
    const canonicalPath = path.resolve(filePath);
    const { node, pathWithSymlinks } = this.#getNearestAncestorNode(
      canonicalPath,
    );
    if (filePath === pathWithSymlinks) {
      assertType(node, "dir");
      assertHasParent(node);
      if (!node.tombstone) return; // already done
    } else if (path.dirname(filePath) === pathWithSymlinks) {
      assertType(node, "dir");
      assertNoTombstone(node);
      node.dir.set(path.basename(filePath), {
        type: "dir",
        fullPath: filePath,
        parent: node,
        dir: new Map(),
        needsFlush: true,
      });
      return;
    }

    if (!opts.recursive && path.dirname(canonicalPath) !== pathWithSymlinks) {
      throw new Error("no such file or directory");
    }

    const rootPath = pathWithSymlinks;
    let maybePath = canonicalPath;
    const toMake: string[] = [];
    while (maybePath !== rootPath) {
      toMake.unshift(
        path.resolve(node.fullPath, path.relative(rootPath, maybePath)),
      );
      maybePath = path.dirname(maybePath);
    }

    for (const dirToMake of toMake) {
      this.mkdir(dirToMake);
    }
  }

  rmdir(directoryPath: string): void {
    const node = this.#getNode(directoryPath);
    if (!node || node.tombstone) {
      return; // this isnt how FS usually work but its what we are doing
    }
    assertType(node, "dir");
    if (node.stub) {
      this.#unstubDirectory(node);
    }

    if (node.dir.size === 0) {
      this.#replaceNode(node, {
        type: "dir",
        tombstone: true,
        needsFlush: true,
      });
    } else {
      throw new Error("directory not empty");
    }
  }

  exists(filePath: string): boolean {
    const node = this.#getNode(filePath); // canonicalizes for us
    return !!node && !node.tombstone;
  }

  readFile(filePath: string, opts?: undefined): Buffer;
  readFile(filePath: string, opts: { encoding: BufferEncoding }): string;
  readFile(filePath: string, opts: { asJson: true }): object;
  readFile(
    filePath: string,
    opts: undefined | { encoding: BufferEncoding; asJson?: false } | {
      encoding?: never;
      asJson: true;
    },
  ) {
    let node = this.#getNodeResolvingSymlinks(filePath); // canonicalizes for us

    if (!node) {
      return undefined;
    }
    assertNotType(node, "dir");
    assertNoTombstone(node);

    if (node.stub) {
      node = this.#replaceNode(node, {
        type: "file",
        file: this.fs.readFileSync(filePath),
        needsFlush: false,
      });
    }

    if (!opts) {
      return Buffer.from(node.file);
    } else if (opts.asJson) {
      return JSON.parse(node.file.toString("utf-8"));
    } else {
      return node.file.toString(opts.encoding);
    }
  }

  writeFile(filePath: string, buffer: Buffer): void;
  writeFile(
    filePath: string,
    body: string,
    opts: { encoding: BufferEncoding },
  ): void;
  writeFile(
    filePath: string,
    body: string,
    opts: { encoding: BufferEncoding },
  ): void;
  writeFile(
    filePath: string,
    body: string | Buffer,
    opts?: { encoding: BufferEncoding },
  ) {
    const fileContentsAsBuffer = typeof body === "string"
      ? Buffer.from(body, opts?.encoding)
      : Buffer.from(body);

    const canonicalPath = path.resolve(filePath);
    const existingNode = this.#getNodeResolvingSymlinks(canonicalPath);
    if (existingNode) {
      if (existingNode.type === "dir") {
        throw new Error("cant write file to a dir");
      }
      this.#replaceNode(existingNode, {
        file: fileContentsAsBuffer,
        type: "file",
        needsFlush: true,
      });
      return;
    }

    const maybeDirNode = this.#getNodeResolvingSymlinks(
      path.dirname(canonicalPath),
    );
    assertExists(maybeDirNode);
    assertType(maybeDirNode, "dir");
    assertNoTombstone(maybeDirNode);

    maybeDirNode.dir.set(path.basename(canonicalPath), {
      type: "file",
      fullPath: canonicalPath,
      parent: maybeDirNode,
      file: fileContentsAsBuffer,
      needsFlush: true,
    });
  }

  deleteFile(filePath: string) {
    const canonicalPath = path.resolve(filePath);
    const node = this.#getNode(canonicalPath);
    if (!node || (node.type === "file" && node.tombstone === true)) return;
    assertNotType(node, "dir");
    this.#replaceNode(node, {
      type: "file",
      tombstone: true,
      needsFlush: true,
    });
  }

  readJson(filePath: string) {
    return this.readFile(filePath, { asJson: true });
  }

  writeJson(filePath: string, o: object): void {
    return this.writeFile(filePath, JSON.stringify(o, undefined, 2) + "\n", {
      encoding: "utf-8",
    });
  }

  async #flushFileNode(
    node: FileNode | FileStubNode | FileTombstoneNode,
  ): Promise<unknown> {
    // FIXME all tombstones need a flush, so we can get rid of needsFlush for them
    if (node.tombstone) {
      try {
        await this.fs.promises.access(node.fullPath);
        return this.fs.promises.unlink(node.fullPath);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // should only throw if file doesnt exist which is no op
        return;
      }
    } else if (node.stub === true || node.needsFlush === false) {
      return;
    } else {
      // we dont do things with file stubs
      return this.fs.promises.writeFile(node.fullPath, node.file);
    }
  }

  async #flushSymlinkNode(node: SymlinkNode) {
    if (!node.needsFlush) return;
    try {
      const linkValue = await this.fs.promises.readlink(node.fullPath);
      if (linkValue === node.symlink) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // expected when the link doesnt exist
    }
    return this.fs.promises.symlink(node.symlink, node.fullPath);
  }

  async #flushDirNode(
    node: DirNode | DirStubNode | DirTombstoneNode,
  ): Promise<unknown> {
    if (!node.tombstone && node.needsFlush) {
      try {
        await this.fs.promises.access(node.fullPath); // throws if the file doesnt exist
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        await this.fs.promises.mkdir(node.fullPath); // throws if it does :(
      }
    }

    const promises: Promise<unknown>[] = [];
    for (const child of node.dir.values()) {
      if (node.tombstone && !child.tombstone) {
        throw new Error(
          "Unexpected failure during sanity check. A non-deleted child is on a deleted dir",
        );
      }
      if (child.type === "dir") {
        promises.push(this.#flushDirNode(child));
      } else if (child.type === "file") {
        promises.push(this.#flushFileNode(child));
      } else if (child.type === "symlink") {
        promises.push(this.#flushSymlinkNode(child));
      } else {
        throw new Error("should never happen");
      }
    }
    await Promise.all(promises);
    if (node.tombstone) {
      return this.fs.promises.rmdir(node.fullPath);
    }
    return;
  }

  flush() {
    const promises: Promise<unknown>[] = [];
    for (const rootNode of this.#trees.values()) {
      promises.push(this.#flushDirNode(rootNode));
    }
    return Promise.all(promises);
  }
}
