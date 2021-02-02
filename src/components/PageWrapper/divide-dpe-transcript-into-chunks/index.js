import chunk from 'lodash.chunk';
import calculateNumberOfHours from './calculate-number-of-hours';

const divideDpeTranscriptIntoChunks = ({ paragraphs, words }) => {
  const numberOfHoursRounded = calculateNumberOfHours(words);
  const wordsCount = words.length - 1;
  const pages = wordsCount / numberOfHoursRounded;
  const pagesAdjustedForArrayIndex = pages - 1;
  const wordsChunk = chunk(words, pagesAdjustedForArrayIndex);
  return wordsChunk;
};

export default divideDpeTranscriptIntoChunks;
