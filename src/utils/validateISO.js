export const isValidISOString = (str) => {
  // 1. Check if the structural format matches ISO 8601 extended format
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;
  if (!isoRegex.test(str)) return false;

  // 2. Check if it's a real, valid calendar date
  const date = new Date(str);
  return !isNaN(date.getTime());
}