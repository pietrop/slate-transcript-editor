import { alignSTT } from 'stt-align-node';
import countWords, { removeExtraWhiteSpaces, splitOnWhiteSpaces, countChar } from '../../../count-words';
import convertWordsToText from '../../../convert-words-to-text';

export function isTextAndWordsListChanged({ text, words }) {
  const wordsText = convertWordsToText(words);
  // TODO: here could optimize to check against word length
  // and only transpose the timcods
  return !(removeExtraWhiteSpaces(text) === wordsText);
}

function isEqualNumberOfWords({ text, words }) {
  const wordsText = convertWordsToText(words);
  const textCount = countChar(text);
  const wordsCount = countChar(wordsText);
  return textCount === wordsCount;
}

export function alignBlock({ block, text, words }) {
  const newBlock = JSON.parse(JSON.stringify(block));
  // if same number of words in words list and text
  // then can do an optimization where you don't need to run diff
  // just transpose words onto the timecodes.
  // this assumes STT will be ok at recognising utterances
  // even if in worste case scenario it might have mis-identified the words
  if (isEqualNumberOfWords({ text, words })) {
    const textList = splitOnWhiteSpaces(text);
    const newWords = JSON.parse(JSON.stringify(words));
    newBlock.children[0].words = newWords.map((word, index) => {
      word.text = textList[index];
      return word;
    });
    return newBlock;
  }
  const alignedWords = alignSTT({ words }, text);
  newBlock.children[0].words = alignedWords;
  return newBlock;
}

export function updateIndividualBlockTimestamps(block) {
  const text = block.children[0].text;
  const words = block.children[0].words;
  if (isTextAndWordsListChanged({ text, words })) {
    const newBlockAligned = alignBlock({ block, text, words });
    return newBlockAligned;
  }
  return block;
}

// This option, diffs text and words in transcripts
function updateBloocksTimestamps(slateJsValue) {
  return slateJsValue.map((block) => {
    return updateIndividualBlockTimestamps(block);
  });
}

export default updateBloocksTimestamps;
