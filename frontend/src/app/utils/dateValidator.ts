export function isValidDate(date: string): boolean {
  const arrayDate = date.split('-');
  const [year, month, day] = [
    parseInt(arrayDate[0]),
    parseInt(arrayDate[1]),
    parseInt(arrayDate[2]),
  ];
  const tempDate = new Date(year, month - 1, day);
  return (
    tempDate.getFullYear() === year &&
    tempDate.getMonth() === month - 1 &&
    tempDate.getDate() === day
  );
}
