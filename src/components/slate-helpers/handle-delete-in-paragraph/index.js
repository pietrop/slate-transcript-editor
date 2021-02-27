import isSameBlock from '../handle-split-paragraph/is-same-block';
import isBeginningOftheBlock from '../handle-split-paragraph/is-beginning-of-the-block';
import isSelectionCollapsed from '../handle-split-paragraph/is-selection-collapsed';
import { isTextAndWordsListChanged, alignBlock } from '../../../util/export-adapters/slate-to-dpe/update-timestamps/update-bloocks-timestamps';
import SlateHelpers from '../index';

/**
 *
 * @return {boolean} - to signal if it was suscesfull at splitting to a parent function
 */
// TODO: refacto clean up to make more legibl
function handleDeleteInParagraph({ editor, event }) {
  const { anchor, focus } = editor.selection;

  const { offset: anchorOffset, path: anchorPath } = anchor;
  const { offset: focusOffset, path: focusPath } = focus;

  if (isSameBlock(anchorPath, focusPath)) {
    if (isBeginningOftheBlock(anchorOffset, focusOffset)) {
      event.preventDefault();
      console.info('in the same block, but at the beginning of a paragraph for now you are not allowed to create an empty new line');
      const [blockNode, path] = SlateHelpers.getClosestBlock(editor);
      const currentBlockNode = blockNode;
      const currentBlockNumber = path[0];
      if (currentBlockNumber === 0) {
        return false;
      }

      const previousBlockNumber = currentBlockNumber - 1;
      const previousBlock = SlateHelpers.getNodebyPath({
        editor,
        path: [previousBlockNumber],
      });

      const previousBlockEndOffset = previousBlock.children[0].text.length;
      const previousBlockText = previousBlock.children[0].text;
      const previousBlockWordsList = previousBlock.children[0].words;
      let currentBlockText = currentBlockNode.children[0].text;
      let currentBlockWordsList = currentBlockNode.children[0].words;
      // if the word have changed. then re-align paragraph before splitting.
      // TODO: this needs re-thinking if there's other re-alignment happening
      // eg on key down debounce
      if (isTextAndWordsListChanged({ text: currentBlockText, words: currentBlockWordsList })) {
        const currentBlockNodeAligned = alignBlock({
          block: currentBlockNode,
          text: currentBlockText,
          words: currentBlockWordsList,
        });
        currentBlockWordsList = currentBlockNodeAligned.children[0].words;
        currentBlockText = currentBlockNodeAligned.children[0].text;
      }

      const newText = previousBlockText + ' ' + currentBlockText;
      const newWords = [...previousBlockWordsList, ...currentBlockWordsList];

      const range = {
        anchor: {
          path: [currentBlockNumber, 0],
          offset: 0,
        },
        focus: {
          path: [previousBlockNumber, 0],
          offset: previousBlockEndOffset,
        },
      };

      const options = {
        at: range,
        mode: 'highest',
      };
      //   const startTimeSecondParagraph = wordsAfter[0].start;
      const { speaker, start, previousTimings, startTimecode } = currentBlockNode;
      const newBlockParagraph = SlateHelpers.createNewParagraphBlock({
        speaker,
        start,
        previousTimings,
        startTimecode,
        text: newText,
        words: newWords,
      });

      SlateHelpers.removeNodes({ editor, options });

      const options2 = {
        at: [previousBlockNumber],
        mode: 'highest',
      };
      SlateHelpers.insertNodesAtSelection({
        editor,
        blocks: [newBlockParagraph],
        moveSelection: false,
        options: options2,
      });

      // move the selection to in the "middle" of the new paragraph where the text of the two is joined.s
      const newOffset = previousBlockText.length;
      const nextPoint = { offset: newOffset, path: [previousBlockNumber, 0] };
      SlateHelpers.setSelection({ editor, nextPoint });
      return true;
    }
    if (isSelectionCollapsed(anchorOffset, focusOffset)) {
      //  In same block but with selection collapsed
      // event.preventDefault();
      return false;
    } else {
      // In same block but with wide selection
      //   event.preventDefault();
      return false;
    }
  } else {
    event.preventDefault();
    console.info('in different block, not handling this use case for now, and collapsing the selection instead');
    SlateHelpers.collapseSelectionToAsinglePoint(editor);
    return false;
  }
}

export default handleDeleteInParagraph;
