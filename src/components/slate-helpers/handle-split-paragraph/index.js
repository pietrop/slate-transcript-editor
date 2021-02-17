/**
 * handles splitting a paragraph, as well as associated block paragraph data
 * such as word timecodes, previous times,
 * and adjusting start time for the paragraph etc..
 */
// import getClosestBlock from '../get-closest-block';
import isSameBlock from './is-same-block';
import isBeginningOftheBlock from './is-beginning-of-the-block.js';
import isSelectionCollapsed from './is-selection-collapsed';
import splitTextAtOffset from './split-text-at-offset';
import splitWordsListAtOffset from './split-words-list-at-offset';
import countWords from '../../../util/count-words';
import SlateHelpers from '../index';

function handleSplitParagraph(editor) {
  const [blockNode, path] = SlateHelpers.getClosestBlock(editor);
  const currentBlockNode = blockNode;

  console.log('editor.selection', editor.selection);
  const { anchor, focus } = editor.selection;
  const { offset: anchorOffset, path: anchorPath } = anchor;
  const anchorPathBlockNumber = anchorPath[0];
  const { offset: focusOffset, path: focusPath } = focus;
  const focusPathBlockNumber = focusPath[0];

  if (isSameBlock(anchorPath, focusPath)) {
    if (isBeginningOftheBlock(anchorOffset, focusOffset)) {
      console.info('in the same block, but at the beginning of a paragraph for now you are not allowed to create an empty new line');
      return;
    }
    if (isSelectionCollapsed(anchorOffset, focusOffset)) {
      const text = currentBlockNode.children[0].text;
      const currentBlockWords = currentBlockNode.children[0].words;
      const { speaker, start } = currentBlockNode;
      const [textBefore, textAfter] = splitTextAtOffset(text, anchorOffset);
      // TODO: edge case splitting in the middle of a word eg find a way to prevent that for now? or is not a problem?
      const numberOfWordsBefore = countWords(textBefore);
      const [wordsBefore, wordsAfter] = splitWordsListAtOffset(currentBlockWords, numberOfWordsBefore);
      console.log('wordsBefore', wordsBefore);
      console.log('wordsAfter', wordsAfter);

      const blockParagraphBefore = SlateHelpers.createNewParagraphBlock({ speaker, start, text: textBefore, words: wordsBefore });
      const startTimeSecondParagraph = wordsAfter[0].start;
      const blockParagraphAfter = SlateHelpers.createNewParagraphBlock({
        speaker,
        start: startTimeSecondParagraph,
        text: textAfter,
        words: wordsAfter,
      });

      console.log('blockParagraphBefore', blockParagraphBefore);
      console.log('blockParagraphAfter', blockParagraphAfter);
      SlateHelpers.removeNodes({ editor });
      SlateHelpers.setNode({ editor, block: blockParagraphBefore, path: path });
      SlateHelpers.insertNodesAtSelection({ editor, blocks: [blockParagraphBefore, blockParagraphAfter], moveSelection: true });
      //   SlateHelpers.setNode(blockParagraphBefore);
      //   SlateHelpers.insertNodesAtSelection({ editor, blocks: [blockParagraphAfter], moveSelection: true });
      // remove paragraph
      //insert these two?
    } else {
      console.info('in same block but with wide selection, not handling this use case for now, and collapsing the selection instead');
      SlateHelpers.collapseSelectionToAsinglePoint(editor);
      return;
    }
  } else {
    console.info('in DIFFERENT block, not handling this use case for now, and collapsing the selection instead');
    SlateHelpers.collapseSelectionToAsinglePoint(editor);
    return;
    // if it's not the same block we can assume the selection is not collapsed either
  }

  // SlateHelpers.collapseSelectionToAsinglePoint(editor);

  // console.log(blockNode, path);
  // get current block

  // get offset

  // split into two blocks
  // split text in children[0].text
  // also split words in children[0].words
  // adjust start time (start and startTimecode) of second block, which is start time of second lsit of words
  // adjust previousTimings

  //delete original block
  // or modify original block
  // and only insert second block

  // insert these two blocks
  // SlateHelpers.insertNodesAtSelection({ editor, blocks: [block] });

  // Editor.insertBreak(editor);

  //////////////////////////////////////////

  //   return;
  //   const selection = editor.selection;
  //   const orderedSelection = [selection.anchor, selection.focus].sort((a, b) => {
  //     return a.path[0] - b.path[0];
  //   });

  //   const selectionStart = orderedSelection[0];
  //   const selectionEnd = orderedSelection[1];
  //   const currentParagraph = editor.children[selectionStart.path[0]];
  //   // Editor.insertBreak(editor);
  //   // Transforms.splitNodes(editor);
  //   // const element = { type: 'image', url, children: [{ text: '' }] };
  //   Editor.deleteFragment(editor, selectionStart.path[0]);
  //   const { startSec, endSec } = SlateHelpers.getSelectionNodes(editor, editor.selection);
}
export default handleSplitParagraph;
