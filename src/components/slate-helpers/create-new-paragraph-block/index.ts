import { shortTimecode } from '../../../util/timecode-converter'; //'../../../timecode-converter';
import generatePreviousTimingsUpToCurrent from '../../../util/dpe-to-slate/generate-previous-timings-up-to-current';
import { Element } from 'slate';

function createNewParagraphBlock({
  speaker,
  start,
  text = '',
  words = [],
  previousTimings,
  startTimecode,
}: {
  speaker: any;
  start: any;
  text: string;
  words: any;
  previousTimings?: any;
  startTimecode?: any;
}): Element {
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
