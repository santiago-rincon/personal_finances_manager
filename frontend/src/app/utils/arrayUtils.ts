// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deleteDuplicate(array: any[]) {
  const arrayStr = array.map(r => JSON.stringify(r));
  return Array.from(new Set(arrayStr)).map(k => JSON.parse(k));
}
