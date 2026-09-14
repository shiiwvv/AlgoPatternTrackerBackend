export const allowValidInputs = (inputObj) => {
  const cleanedData = {};

  for (const [key, value] of Object.entries(inputObj)) {
    if (value !== undefined && value !== null) {
      
      if (typeof value === "string" && value.trim() === "") continue;
      
      cleanedData[key] = value;
    }
  }

  return Object.keys(cleanedData).length === 0 ? null : cleanedData;
};