export const removeExtraWhiteSpaces = (text) => {
  return text.trim().replace(/\s\s+/g, ' ');
};

export const splitOnWhiteSpaces = (text) => {
  return removeExtraWhiteSpaces(text).split(' ');
};

export const countChar = (text) => {
  // remove white spaces and count chat
  return splitOnWhiteSpaces(text).join('').length;
};

const countWords = (text) => {
  // return text.trim().replace(/\n /g, '').replace(/\n/g, ' ').split(' ').length;
  // Don't count multiple spaces as multiple words
  // https://www.w3schools.com/jsref/jsref_regexp_whitespace.asp
  // Do a global search for whitespace characters in a string
  return splitOnWhiteSpaces(text).length;
};

export default countWords;
