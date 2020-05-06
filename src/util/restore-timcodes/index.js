import convertDpeToSlate from '../dpe-to-slate';
import converSlateToDpe from '../export-adapters/slate-to-dpe/index.js';

const restoreTimecodes = ({ slateValue, transcriptData }) => {
  const aligneDpeData = converSlateToDpe(slateValue, transcriptData);
  const alignedSlateData = convertDpeToSlate(aligneDpeData);
  return alignedSlateData;
};

export default restoreTimecodes;
