/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { checkAlpha } from "./util/checkAlpha.js";
import { createRuleFactory } from "./util/createRuleFactory.js";

export const alphabeticalDependencies = createRuleFactory<undefined>({
  name: "alphabeticalDependencies",
  check: (context) => {
    checkAlpha(context, "dependencies");
    checkAlpha(context, "devDependencies");
    checkAlpha(context, "peerDependencies");
  },
  validateOptions: () => {},
});
