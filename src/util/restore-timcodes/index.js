import convertDpeToSlate from '../dpe-to-slate';
import { convertSlateToDpeAsync } from '../export-adapters/slate-to-dpe/index.js';

const restoreTimecodes = async ({ slateValue, transcriptData }) => {
  const aligneDpeData = await convertSlateToDpeAsync(slateValue, transcriptData);
  const alignedSlateData = convertDpeToSlate(aligneDpeData);
  return alignedSlateData;
};

export default restoreTimecodes;
