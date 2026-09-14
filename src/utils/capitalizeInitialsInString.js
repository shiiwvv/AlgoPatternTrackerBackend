export const capitalizeInitialsInString = (str) => {
    return str
            .split(" ")
            .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
            .join(" ");
};