export default function removeDuplicates(array: Array<any>) {
  return array.filter((value, index) => {
    const _value = JSON.stringify(value);
    return index === array.findIndex((obj) => JSON.stringify(obj) === _value);
  });
}
