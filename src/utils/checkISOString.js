export const isValidISOString = (str) => {
  // CORRECT BASIC CHECK: Ensures the input exists and is a string
  if (!str || typeof str !== 'string') return false; 
  
  const timestamp = Date.parse(str);
  if (isNaN(timestamp)) return false;
  
  const date = new Date(str);
  // Optional strict check: checks if the string completely matches the exact ISO output
  return !isNaN(date.getTime()); 
}
