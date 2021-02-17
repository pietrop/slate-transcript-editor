import { shortTimecode } from '../../../util/timecode-converter'; //'../../../timecode-converter';
// TODO: refactor to use this `generatePreviousTimingsUpToCurrentOne` in other parts of the code
// to see if it's more performant
// https://stackoverflow.com/questions/3751520/how-to-generate-sequence-of-numbers-chars-in-javascript
function generatePreviousTimingsUpToCurrentOne(start) {
  return new Array(parseInt(start))
    .fill(1)
    .map((_, i) => i + 1)
    .join(' ');
}

function createNewParagraphBlock({ speaker, start, text = '', words = [], previousTimings, startTimecode }) {
  let newPreviousTimings = previousTimings;
  if (!newPreviousTimings) {
    newPreviousTimings = generatePreviousTimingsUpToCurrentOne(start);
  }
  let newStartTimecode = startTimecode;
  if (!newStartTimecode) {
    newStartTimecode = shortTimecode(start);
  }
  return {
    speaker,
    start,
    previousTimings: newPreviousTimings,
    startTimecode: newStartTimecode,
    type: 'timedText',
    children: [
      {
        text,
        words,
      },
    ],
  };
}

export default createNewParagraphBlock;
