export function isSameObjectId(left: { toString(): string } | null | undefined, right: { toString(): string } | null | undefined): boolean {
  return left?.toString() === right?.toString();
}
