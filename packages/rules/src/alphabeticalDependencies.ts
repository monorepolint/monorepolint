/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import * as r from "runtypes";
import { checkAlpha } from "./util/checkAlpha.js";
import { makeRule } from "./util/makeRule.js";
const Options = r.Undefined;

export const alphabeticalDependencies = makeRule({
  name: "alphabeticalDependencies",
  check: (context) => {
    checkAlpha(context, "dependencies");
    checkAlpha(context, "devDependencies");
    checkAlpha(context, "peerDependencies");
  },
  optionsRuntype: Options,
});
