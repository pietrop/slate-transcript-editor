import convertDpeToSlate from '../../../util/dpe-to-slate';
const chunkParagraphsFromDpeToSlateList = (dpeTranscripts) => {
  const result = dpeTranscripts.map((dpeT) => {
    return convertDpeToSlate(dpeT);
  });
  return result;
};

export default chunkParagraphsFromDpeToSlateList;
