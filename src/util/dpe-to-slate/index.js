import { shortTimecode } from '../timecode-converter';

/**
 *
 * `generatePreviousTimingsUpToCurrent` is used to
 *  add a `previousTimings` data attribute
 * to the paragraph `TimedTextElement` in `renderElement`
 * This makes it possible to do css injection to hilight current timings
 * `.timecode[data-previous-timings*="${listOfPreviousTimingsUpToCurrentOne}"]
 *
 * where `listOfPreviousTimingsUpToCurrentOne` is dinamically generated up to the current one.
 * eg if current time is `3` then `listOfPreviousTimingsUpToCurrentOne` "0 1 2"
 */

import getWordsForParagraph from '../get-words-for-paragraph';
import generatePreviousTimingsUpToCurrent from './generate-previous-timings-up-to-current';

/**
 * splices a list of times, int, up to a certain, index current time.
 * eg  `totalTimingsInt` is [0, 1, 2, 3, 4, 5] and `time` is 3, it retusn "0 1 2"
 * then it returns
 * @param {Array} totalTimingsInt -  list of timings int, generated with `generatePreviousTimings`
 * @param {Number} time - float, time in seconds
 * @returns {String}
 */

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

const generateText = (paragraph, words) => {
  return words
    .filter((word) => word.start >= paragraph.start && word.end <= paragraph.end)
    .map((w) => w.text)
    .join(' ');
};

const convertDpeToSlate = (transcript) => {
  if (isEmpty(transcript)) {
    return [
      {
        speaker: 'U_UKN',
        start: 0,
        previousTimings: '0',
        startTimecode: '00:00:00',
        type: 'timedText',
        children: [
          {
            text: 'Text',
            // Adding list of words in slateJs paragraphs
            words: [],
          },
        ],
      },
    ];
  }

  const { words, paragraphs } = transcript;

  return paragraphs.map((paragraph) => ({
    speaker: paragraph.speaker,
    start: paragraph.start,
    previousTimings: generatePreviousTimingsUpToCurrent(paragraph.start),
    // pre-computing the display of the formatting here so that it doesn't need to convert it in leaf render
    startTimecode: shortTimecode(paragraph.start),
    type: 'timedText',
    children: [
      {
        text: generateText(paragraph, words),
        // Adding list of words in slateJs paragraphs
        words: getWordsForParagraph(paragraph, words),
      },
    ],
  }));
};

export default convertDpeToSlate;
