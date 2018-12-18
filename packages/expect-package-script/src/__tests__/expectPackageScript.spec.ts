// tslint:disable:variable-name
// tslint:disable:no-console
const mockFiles: Map<string, string> = new Map();

jest.mock("fs", () => ({
  writeFileSync: function writeFileSync(filePath: string, contents: string) {
    mockFiles.set(filePath, contents);
  },

  readFileSync: function readFileSync(filePath: string, _contentType: string) {
    return mockFiles.get(filePath);
  }
}));

import { Failure, PackageContext } from "@monorepo-lint/core";
import expectPackageScript from "../expectPackageScript";

const PACKAGE_WITHOUT_SCRIPTS =
  JSON.stringify(
    {
      name: "package-without-scripts"
    },
    undefined,
    2
  ) + "\n";

const MISSING_SCRIPT_NAME = "missing";
const MISSING_SCRIPT_VALUE = "missing value";

const SCRIPT_NAME = "exists";
const SCRIPT_VALUE = "exists value";

const PACKAGE_WITH_SCRIPTS =
  JSON.stringify(
    {
      name: "package-with-scripts",
      scripts: {
        [SCRIPT_NAME]: SCRIPT_VALUE
      }
    },
    undefined,
    2
  ) + "\n";

describe("expectPackageScript", () => {
  afterEach(() => {
    mockFiles.clear();
  });

  describe("fix: false", () => {
    const context = new PackageContext(".", {
      checks: [],
      fix: false,
      verbose: false
    });

    const spy = jest.spyOn(context, "addError");

    afterEach(() => {
      spy.mockClear();
    });

    it("handles an empty script section", () => {
      mockFiles.set("package.json", PACKAGE_WITHOUT_SCRIPTS);

      expectPackageScript(context, {
        name: "foo",
        value: "bar"
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("No scripts block in package.json");
    });
  });

  describe("fix: true", () => {
    const context = new PackageContext(".", {
      checks: [],
      fix: true,
      verbose: false
    });
    const spy = jest.spyOn(context, "addError");

    afterEach(() => {
      spy.mockClear();
    });

    it("fixes an empty script section", () => {
      mockFiles.set("package.json", PACKAGE_WITHOUT_SCRIPTS);

      expectPackageScript(context, {
        name: "foo",
        value: "bar"
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe("No scripts block in package.json");

      expect(JSON.parse(mockFiles.get("package.json")!).scripts).toEqual({});
    });

    it("adds a script", () => {
      mockFiles.set("package.json", PACKAGE_WITH_SCRIPTS);

      expectPackageScript(context, {
        name: MISSING_SCRIPT_NAME,
        value: MISSING_SCRIPT_VALUE
      });

      expect(spy).toHaveBeenCalledTimes(1);

      const failure: Failure = spy.mock.calls[0][0];
      expect(failure.file).toBe("package.json");
      expect(failure.fixer).not.toBeUndefined();
      expect(failure.message).toBe(
        `Expected standardized script entry for '${MISSING_SCRIPT_NAME}'`
      );

      expect(
        JSON.parse(mockFiles.get("package.json")!).scripts[MISSING_SCRIPT_NAME]
      ).toEqual(MISSING_SCRIPT_VALUE);
    });

    it("does nothing if the value exists", () => {
      mockFiles.set("package.json", PACKAGE_WITH_SCRIPTS);

      expectPackageScript(context, {
        name: SCRIPT_NAME,
        value: SCRIPT_VALUE
      });

      expect(spy).not.toHaveBeenCalled();

      expect(JSON.parse(mockFiles.get("package.json")!).scripts).toEqual({
        [SCRIPT_NAME]: SCRIPT_VALUE
      });
    });
  });
});
