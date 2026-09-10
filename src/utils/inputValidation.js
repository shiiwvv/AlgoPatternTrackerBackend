export const inputValidate = (input) => {
    return input.some((field) => (!field || field?.trim() === ""));
}   