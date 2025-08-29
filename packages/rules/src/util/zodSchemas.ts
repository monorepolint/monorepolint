/*!
 * Copyright 2019 Palantir Technologies, Inc.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 */

import { z } from "zod";
import { REMOVE } from "../REMOVE.js";

/**
 * Reusable Zod schema for the REMOVE symbol.
 * This schema validates that a value is exactly the REMOVE symbol.
 */
export const ZodRemove = z.custom<typeof REMOVE>((x) => x === REMOVE);
