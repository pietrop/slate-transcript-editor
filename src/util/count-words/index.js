export const removeExtraWhiteSpaces = (text) => {
  return text.trim().replace(/\s\s+/g, ' ');
};

const countWords = (text) => {
  // return text.trim().replace(/\n /g, '').replace(/\n/g, ' ').split(' ').length;
  // Don't count multiple spaces as multiple words
  // https://www.w3schools.com/jsref/jsref_regexp_whitespace.asp
  // Do a global search for whitespace characters in a string
  return removeExtraWhiteSpaces(text).split(' ').length;
};

export default countWords;
