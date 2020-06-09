---
title: Command Line Interface
---

Print errors for non-standard packages:

```shell
$ monorepolint check
```

or use the shorter alias:

```shell
$ mrl check
```

Print human-readable details for each error:

```shell
$ mrl check --verbose
```

Fix all automatically fixable errors:

```shell
$ mrl check --fix
```
