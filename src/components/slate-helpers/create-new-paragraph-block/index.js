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

function createNewParagraphBlock({ speaker, start, text = '', words = [] }) {
  return {
    speaker,
    start,
    previousTimings: generatePreviousTimingsUpToCurrentOne(start),
    startTimecode: shortTimecode(start),
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
