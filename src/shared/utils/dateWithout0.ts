export default function dateWithout0(date: string) {
  const splittedDate = date.split('/');
  const day = Number(splittedDate[0]);
  const month = Number(splittedDate[1]);
  const year = Number(splittedDate[2]);

  return `${day}/${month}/${year}`;
}
