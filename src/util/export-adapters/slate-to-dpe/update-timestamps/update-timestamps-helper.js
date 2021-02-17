/**
 * converted from react-transcript-editor draftJS update timestamp helper function
 * https://github.com/pietrop/react-transcript-editor/blob/master/packages/components/timed-text-editor/UpdateTimestamps/index.js
 *
 */
import { alignSTT } from 'stt-align-node';
// import alignSTT from '../../../stt-align-node';
import slateToText from '../../txt';
import convertDpeToSlate from '../../../dpe-to-slate';
import { shortTimecode } from '../../../timecode-converter/index.js';
import SlateHelpers from '../../../../components/slate-helpers';
import _ from 'lodash';
// import difference from 'lodash/difference';

function comparator(object, other) {
  return _.isEqual(object.children[0].text, other.children[0].text);
}

export const updateTimestampsHelperForSpecificParagraph = ({ editor, path }) => {
  let newDiffParagraph;
  if (path) {
    newDiffParagraph = SlateHelpers.getNodebyPath({ editor, path });
  } else {
    const [blockNode, path] = SlateHelpers.getClosestBlock(editor);
    newDiffParagraph = JSON.parse(JSON.stringify(blockNode));
  }

  const alignedWordsTest = alignSTT(newDiffParagraph.children[0], newDiffParagraph.children[0].text);
  newDiffParagraph.children[0].words = alignedWordsTest;
  newDiffParagraph.start = alignedWordsTest[0].start;
  newDiffParagraph.startTimecode = shortTimecode(alignedWordsTest[0].start);

  console.log('newDiffParagraph', newDiffParagraph);
  SlateHelpers.removeNodes({ editor });
  // insert these two blocks
  SlateHelpers.insertNodesAtSelection({
    editor,
    blocks: [newDiffParagraph],
    // moveSelection: true,
  });
};
/**
 * Update timestamps usign stt-align module
 * @param {*} currentContent - slate js value
 * @param {*} words - list of stt words
 * @return slateJS value
 */
// TODO: do optimization mentions in TODOS below and try out on 5 hours long to see if UI Still freezes.
// TODO: in stt-align-node if all the words are completely diff, it seems to freeze.
// Look into why in stt-align-node github repo etc..
export const updateTimestampsHelper = (currentContent, dpeTranscript) => {
  // TODO: figure out if can remove the cloneDeep option
  const newCurrentContent = _.cloneDeep(currentContent);
  // trying to align only text that changed

  // TODO: ideally, you save the slate converted content in the parent component when
  // component is initialized so don't need to re-convert this from dpe all the time.
  const originalContentSlateFormat = convertDpeToSlate(dpeTranscript);

  // TODO: add the ID further upstream to be able to skip this step.
  // we are adding the index for the paragraph,to be able to update the words attribute in the paragraph and easily replace that paragraph in the
  // slate editor content.
  // Obv this wouldn't work, if re-enable the edge cases, disabled above in handleOnKeyDown
  const currentSlateContentWithId = currentContent.map((paragraph, index) => {
    const newParagraph = { ...paragraph };
    newParagraph.id = index;
    return newParagraph;
  });
  const diffParagraphs = _.differenceWith(currentSlateContentWithId, originalContentSlateFormat, comparator);

  diffParagraphs.forEach((diffParagraph) => {
    // TODO: figure out if can remove the cloneDeep option
    let newDiffParagraph = _.cloneDeep(diffParagraph);
    let alignedWordsTest = alignSTT(newDiffParagraph.children[0], newDiffParagraph.children[0].text);
    newDiffParagraph.children[0].words = alignedWordsTest;
    // also adjust paragraph timecode
    // NOTE: in current implementation paragraphs cannot be modified, so this part is not necessary
    // but keeping because eventually will handle use cases where paragraphs are modified.
    newDiffParagraph.start = alignedWordsTest[0].start;
    newDiffParagraph.startTimecode = shortTimecode(alignedWordsTest[0].start);
    newCurrentContent[newDiffParagraph.id] = newDiffParagraph;
  });

  // covert slate to text to use alignment module
  // const currentText = slateToText({
  //   value: currentContent,
  //   speakers: false,
  //   timecodes: false,
  //   atlasFormat: false,
  // });
  // const alignedWords = alignSTT(dpeTranscript, currentText);
  return newCurrentContent;
};

export default updateTimestampsHelper;
