export default function renderArray(
  strings: Array<string>,
  textWhenNone?: string,
) {
  if (!strings) {
    return null;
  }
  if (!strings.length) {
    return textWhenNone;
  }
  if (strings.length === 1) {
    return strings[0];
  }
  if (strings.length === 2) {
    return `${strings[0]} e ${strings[1]}`;
  }
  return `${strings.slice(0, -1).join(', ')} e ${strings[strings.length - 1]}`;
}
