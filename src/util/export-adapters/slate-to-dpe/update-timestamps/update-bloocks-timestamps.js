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
  // Quick fix, if there's words with empty string in the block
  // for some issues further upstream, either in the initial conversion
  // from STT or in previosu alignments (?)
  const sanitizedWords = removeEmptyWords(words);
  const wordsText = convertWordsToText(sanitizedWords);
  const textCount = countChar(text);
  const wordsCount = countChar(wordsText);
  return textCount === wordsCount;
}

/**
 * quick workaround, sometime the alignment in alignSTT
 * module results in words with either no text attribute or an empty string
 * This removes those words as thy cause issue with the alignment
 * TODO: figure out a better fix in the alignSTT repo further upstream
 */
function removeEmptyWords(words) {
  return words.filter((word) => {
    return word.text;
  });
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
  newBlock.children[0].words = removeEmptyWords(alignedWords);
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
