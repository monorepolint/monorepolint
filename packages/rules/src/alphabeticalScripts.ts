/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { checkAlpha } from "./util/checkAlpha.js";
import { createRuleFactory } from "./util/createRuleFactory.js";

export const alphabeticalScripts = createRuleFactory<undefined>({
  name: "alphabeticalScripts",
  check: (context) => {
    checkAlpha(context, "scripts");
  },
  validateOptions: () => {},
});
