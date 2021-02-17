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
  console.log('editor.selection', editor.selection);
  const { anchor, focus } = editor.selection;
  const { offset: anchorOffset, path: anchorPath } = anchor;
  const { offset: focusOffset, path: focusPath } = focus;

  if (isSameBlock(anchorPath, focusPath)) {
    if (isBeginningOftheBlock(anchorOffset, focusOffset)) {
      console.info('in the same block, but at the beginning of a paragraph for now you are not allowed to create an empty new line');
      return;
    }
    if (isSelectionCollapsed(anchorOffset, focusOffset)) {
      const [blockNode, path] = SlateHelpers.getClosestBlock(editor);
      const currentBlockNode = blockNode;

      console.log('isSelectionCollapsed', isSelectionCollapsed(anchorOffset, focusOffset));
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

      SlateHelpers.removeNodes({ editor });
      SlateHelpers.insertNodesAtSelection({ editor, blocks: [blockParagraphBefore, blockParagraphAfter], moveSelection: true });
      return;
    } else {
      console.info('in same block but with wide selection, not handling this use case for now, and collapsing the selection instead');
      SlateHelpers.collapseSelectionToAsinglePoint(editor);
      return;
    }
  } else {
    console.info('in different block, not handling this use case for now, and collapsing the selection instead');
    SlateHelpers.collapseSelectionToAsinglePoint(editor);
    return;
  }

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
