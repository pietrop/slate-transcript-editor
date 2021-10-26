import SlateTranscriptEditor from './components/index.js';
import { secondsToTimecode, timecodeToSeconds, shortTimecode } from '@pietrop/timecode-converter';
import convertDpeToSlate from './util/dpe-to-slate/index.js';
import converSlateToDpe from './util/export-adapters/slate-to-dpe/index.js';
import slateToText from './util/export-adapters/txt';

export default SlateTranscriptEditor;

export { SlateTranscriptEditor, secondsToTimecode, timecodeToSeconds, shortTimecode, convertDpeToSlate, converSlateToDpe, slateToText };
