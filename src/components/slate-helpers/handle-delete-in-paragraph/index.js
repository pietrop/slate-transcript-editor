import isSameBlock from '../handle-split-paragraph/is-same-block';
import isBeginningOftheBlock from '../handle-split-paragraph/is-beginning-of-the-block';
import isSelectionCollapsed from '../handle-split-paragraph/is-selection-collapsed';
import SlateHelpers from '../index';

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
        return;
      }
      const previousBlockNumber = currentBlockNumber - 1;
      const previousBlock = SlateHelpers.getNodebyPath({
        editor,
        path: [previousBlockNumber],
      });

      const previousBlockEndOffset = previousBlock.children[0].text.length;
      const previousBlocText = previousBlock.children[0].text;
      const previousBlockWordsList = previousBlock.children[0].words;
      const currentBlockText = currentBlockNode.children[0].text;
      const currentBlockWordsList = currentBlockNode.children[0].words;
      const newText = previousBlocText + ' ' + currentBlockText;
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
      const newOffset = previousBlocText.length;
      const nextPoint = { offset: newOffset, path: [previousBlockNumber, 0] };
      SlateHelpers.setSelection({ editor, nextPoint });
      return;
    }
    if (isSelectionCollapsed(anchorOffset, focusOffset)) {
      //  In same block but with selection collapsed
      // event.preventDefault();
      return;
    } else {
      // In same block but with wide selection
      //   event.preventDefault();
      return;
    }
  } else {
    event.preventDefault();
    console.info('in different block, not handling this use case for now, and collapsing the selection instead');
    SlateHelpers.collapseSelectionToAsinglePoint(editor);
    return;
  }
}

export default handleDeleteInParagraph;
