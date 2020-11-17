import secondsToTimecode from '../timecode-converter/src/secondsToTimecode';

const insertTimecodesInline = ({ intervalSeconds = 30, transcriptData }) => {
  let lastInsertTime = 0;

  const sortedWords = transcriptData.words.sort((a, b) => a.start - b.start);

  let newWords = [];
  for (const word of sortedWords) {
    if (word.start - lastInsertTime > intervalSeconds) {
      lastInsertTime = Math.floor(word.start / intervalSeconds) * intervalSeconds;
      const timecode = secondsToTimecode(lastInsertTime);
      newWords.push({ start: word.start, end: word.start + (word.end - word.start) / 2, text: `[${timecode}]` });
      word.start = word.start + (word.end - word.start) / 2;
    }
    newWords.push(word);
  }
  return {
    ...transcriptData,
    words: newWords,
  };
};
export default insertTimecodesInline;
