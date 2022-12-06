/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/config";
import * as r from "runtypes";
import { checkAlpha } from "./util/checkAlpha";
import { createNewRuleConversion } from "./util/createNewRuleConversion";

const Options = r.Undefined;

export const alphabeticalDependencies: RuleModule<typeof Options> = {
  check: function expectAlphabeticalDependencies(context: Context) {
    checkAlpha(context, "dependencies");
    checkAlpha(context, "devDependencies");
    checkAlpha(context, "peerDependencies");
  },
  optionsRuntype: Options,
};

export const AlphabeticalDependencies = createNewRuleConversion("AlphabetialDependencies", alphabeticalDependencies);
