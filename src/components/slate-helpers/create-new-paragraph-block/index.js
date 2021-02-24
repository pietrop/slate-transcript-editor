import { shortTimecode } from '../../../util/timecode-converter'; //'../../../timecode-converter';
import generatePreviousTimingsUpToCurrent from '../../../util/dpe-to-slate/generate-previous-timings-up-to-current';

function createNewParagraphBlock({ speaker, start, text = '', words = [], previousTimings, startTimecode }) {
  let newPreviousTimings = previousTimings;
  if (!newPreviousTimings) {
    newPreviousTimings = generatePreviousTimingsUpToCurrent(start);
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
