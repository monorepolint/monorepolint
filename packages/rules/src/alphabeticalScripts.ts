/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { checkAlpha } from "./util/checkAlpha.js";
import { makeRule } from "./util/makeRule.js";

export const alphabeticalScripts = makeRule<undefined>({
  name: "alphabeticalScripts",
  check: (context) => {
    checkAlpha(context, "scripts");
  },
  validateOptions: () => {},
});
