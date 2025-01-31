import { RuleModule } from "@monorepolint/config";

export function ifTrue<X>(
  condition: boolean,
  value: X[],
  otherwise?: X[],
): X[];
export function ifTrue<X, Y>(
  condition: boolean,
  value: X,
  otherwise: Y[],
): X[] | Y[];
export function ifTrue<X>(
  condition: boolean,
  value: X,
): X;
export function ifTrue<X, Y>(
  condition: boolean,
  value: X,
  otherwise: Y,
): X | Y;
export function ifTrue(
  condition: boolean,
  value: RuleModule[] | object,
  otherwise: RuleModule[] | object = Array.isArray(value) ? [] : {},
) {
  return condition
    ? value
    : otherwise;
}
