import getClosestBlock from './get-closest-block';
import getSelectionNodes from './get-selection-nodes';
import insertNodesAtSelection from './insert-nodes-at-selection';
import insertText from './insert-text';
import mergeNodes from './merge-nodes';
import removeNodes from './remove-nodes';
import setNode from './set-node';
import splitNodes from './split-nodes';
import breakParagraph from './break-paragraph';
import collapseSelectionToAsinglePoint from './collapse-selection-to-a-single-point';
import handleSplitParagraph from './handle-split-paragraph';
import createNewParagraphBlock from './create-new-paragraph-block';
const SlateHelpers = {
  getClosestBlock,
  getSelectionNodes,
  insertNodesAtSelection,
  mergeNodes,
  removeNodes,
  setNode,
  splitNodes,
  breakParagraph,
  insertText,
  collapseSelectionToAsinglePoint,
  handleSplitParagraph,
  createNewParagraphBlock,
};

export default SlateHelpers;
