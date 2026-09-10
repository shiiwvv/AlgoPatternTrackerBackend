export const allowValidInputs = (inputs) => {
  const object = {};
  
  inputs.forEach((Obj) => {
    const keys = Object.keys(Obj);
    const prop = keys[0];
    if (keys.length !== 0 && Obj[`${prop}`] && Obj[`${prop}`]?.trim() !== "") {
      object[`${prop}`] = Obj[`${prop}`];
    }
  });

  if(Object.keys(object).length === 0){
    return null;
  }

  return object;
};
