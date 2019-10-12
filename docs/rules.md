# Rules

Monorepolint comes with a number of builtin rules.

To add your own custom rules see `writing-custom-rules.md`

## Alphabetical Dependencies

[source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/alphabeticalDependencies.ts)

Makes sure that all dependency blocks are orderded alphabetically.

### Example

```javascript
module.exports = {
  rules: {
    ":alphabetical-dependencies": true,
  }
};
```

## Banned Dependencies

[source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/bannedDependencies.ts)

Disallow problematic dependencies.

### Options

* `bannedDependencies`
  - An array of depedency names to ban

### Example

```javascript
module.exports = {
  rules: {
    ":banned-dependencies": {
      options: {
        bannedDependencies: ["lodash"]
      }
    }
  }
};
```

## Consistent Dependencies

[source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/consistentDependencies.ts)

Enforce dependency versions are consistent with workspace root.

### Example

```javascript
module.exports = {
  rules: {
    ":consistent-dependencies": true
  }
};
```

## File Contents

[source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/fileContents.ts)

Enforce each package has a file with certain contents enforced by either a template or generator.

### Options

* `file`
  - Name of the file
* `generator` (Optional)
  - Function that can generate the file
* `template` (Optional)
  - Expected file contents
* `templateFile` (Optional)
  - Path to a file to use as a template

Exactly one of `generator`, `template`, or `templateFile` needs to be specified.

### Example

```javascript
module.exports = {
  rules: {
    "file-contents": {
      options: {
        templateFile: "./templates/jest.config.js"
      }
    }
  }
};
```

## Package Entries

[source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/packageEntry.ts)

Standardize arbitrary entries in package.json.

### Options

* `entries`
  - An object of expected key value pairs for the package.json
* `entriesExists`
  - An array of expected keys to exist in package.json (without any value enforcement)

### Example

```javascript
module.exports = {
  rules: {
    ":package-entry": {
      options: {
        entries: {
          "author": "Eric L Anderson (https://github.com/ericanderson)"
        },
        entriesExists: [
          "bugs"
        ]
      }
    }
  }
};
```

## Package Order

[source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/packageOrder.ts)

Standardize entry order in package.json.

### Options

* `order` (Optional)
  - Either a comparator function on keys or an array of expected package order. If a a key is missing from this array, it will be at the bottom of the package.json. If missing, uses a default ordering found below.

### Example

```javascript
module.exports = {
  rules: {
    ":package-order": {
      options: {
        order: [
          "name",
          "version",
          "author",
          "contributors",
          "url",
          "license",
          "private",
          "engines",
          "bin",
          "main",
          "module",
          "typings",
          "style",
          "sideEffects",
          "workspaces",
          "husky",
          "lint-staged",
          "files",
          "scripts",
          "resolutions",
          "dependencies",
          "peerDependencies",
          "devDependencies",
          "optionalDependencies",
          "publishConfig"
        ]
      }
    }
  }
};
```

## Package Script

[source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/packageScript.ts)

Standardize package scripts. This is a seperate rule from Package Entries to make it easy to have multiple package script rules apply to one package.

### Options

* `scripts`
  - An object of expected key value pairs for the scripts block

### Example

```javascript
module.exports = {
  rules: {
    ":package-script": {
      options: {
        scripts: {
          "clean": "rm -rf build lib node_modules *.tgz",
          "compile": "../../node_modules/.bin/tsc",
          "goodbye": {
            options: [undefined],
            fixValue: undefined, // fix removes value
          },
          "any-of-these-no-auto-fix": {
            options: ["a", "b", "c"],
          },
          "any-of-these-auto-fix-to-c": {
            options: ["a", "b", "c"],
            fixValue: "c"
          }
        }
      }
    }
  }
};
```

## Standard Typescript Config

[source](https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/standardTsconfig.ts)

Special case of the File Contents rule for typescript configs. Using a template file for the typescript config, auto discover ands adds project references to the config

### Options

* `generator` (Optional)
  - Function that can generate the config
* `template` (Optional)
  - Expected config contents
* `templateFile` (Optional)
  - Path to a file to use as a template

Exactly one of `generator`, `template`, or `templateFile` needs to be specified.

### Example

```javascript
module.exports = {
  rules: {
    ":standard-tsconfig": {
      options: {
        templateFile: "./templates/tsconfig.json"
      }
    }
  }
};
```
