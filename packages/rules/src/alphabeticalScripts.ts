/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/config";
import * as r from "runtypes";
import { checkAlpha } from "./util/checkAlpha.js";
import { createNewRuleConversion } from "./util/createNewRuleConversion.js";
const Options = r.Undefined;

export const alphabeticalScripts: RuleModule<typeof Options> = {
  check: function expectAlphabeticalScripts(context: Context) {
    checkAlpha(context, "scripts");
  },
  optionsRuntype: Options,
};

export const AlphabeticalScripts = createNewRuleConversion("AlphabeticalScripts", alphabeticalScripts);
