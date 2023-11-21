export function setDeepEquals<T>(set1: Set<T>, set2: Set<T>): boolean {
  if (set1 === set2) return true;
  if (set1 === null || set2 === null) return false;
  if (set1.size !== set2.size) return false;

  return Array.from(set1).every((element) => set2.has(element));
}
