/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { Context, RuleModule } from "@monorepolint/core";
import * as r from "runtypes";
import { checkAlpha } from "./util/checkAlpha";

const Options = r.Undefined;

export const alphabeticalScripts: RuleModule<typeof Options> = {
  check: function expectAlphabeticalScripts(context: Context) {
    checkAlpha(context, "scripts");
  },
  optionsRuntype: Options,
};
