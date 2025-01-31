import { describe, expect, expectTypeOf, it } from "vitest";
import { ifTrue } from "./ifTrue.js";

describe(ifTrue, () => {
  describe("when the condition is true", () => {
    it("returns the value", () => {
      expect(ifTrue(true, "hi")).toEqual("hi");
      expect(ifTrue(true, ["hi"])).toEqual(["hi"]);
      expect(ifTrue(true, { hi: "mom" })).toEqual({ hi: "mom" });
    });
  });

  describe("when the condition is false", () => {
    describe("and the truthy value is an object", () => {
      it("returns an empty object if the condition is false", () => {
        expect(ifTrue(false, { hi: "mom" })).toEqual({});
        expectTypeOf(ifTrue(false, { hi: "mom" })).toEqualTypeOf<
          { hi: string }
        >();
      });
    });

    describe("and the truthy value is an array", () => {
      it("returns an empty array if the condition is false", () => {
        expect(ifTrue(false, [1])).toEqual([]);
        expectTypeOf(ifTrue(false, [1])).toEqualTypeOf<number[]>();
      });
    });
  });
});
