const calculateNumberOfHours = (words) => {
  const wordsLength = words.length;
  const wordCountIndex = wordsLength - 1;
  const lastWord = words[wordCountIndex];
  const endTime = lastWord.end;
  const numberOfHours = endTime / 3600; // 1 hour => 3600 sec - 20min => 1200 sec
  // const numberOfHours = endTime / 1200;
  // const numberOfHoursRounded = Math.ceil(numberOfHours);
  const numberOfHoursRounded = Math.round(numberOfHours);
  return numberOfHoursRounded;
};

export default calculateNumberOfHours;
