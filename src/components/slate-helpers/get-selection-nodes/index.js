const getSelectionNodes = (editor, selection) => {
  try {
    const orderedSelection = [selection.anchor, selection.focus].sort((a, b) => {
      return a.path[0] - b.path[0];
    });
    const selectionStart = orderedSelection[0];
    const selectionEnd = orderedSelection[1];
    let counterAnchor = 0;
    let goalAnchor = selectionStart.offset;
    let targetWordIndexAnchor = null;
    let selectedLeafWordsAnchor = editor.children[selectionStart.path[0]].children[0].words;
    // let pathValue = selectionStart.path;
    // let selectedLeafWordsAnchor2 = editor.children[selectionStart.path].children[0].words;

    selectedLeafWordsAnchor.forEach((word, wordIndex) => {
      const wordLength = (word.text + ' ').length;

      counterAnchor = counterAnchor + wordLength;
      if (counterAnchor <= goalAnchor) {
        targetWordIndexAnchor = wordIndex;
      }
    });

    const startWord = selectedLeafWordsAnchor[targetWordIndexAnchor + 1];

    let counter = 0;
    let goal = selectionEnd.offset;
    let targetWordIndex = null;
    let selectedLeafWords = editor.children[selectionEnd.path[0]].children[0].words;
    selectedLeafWords.forEach((word, wordIndex) => {
      const wordLength = (word.text + ' ').length;

      counter = counter + wordLength;
      if (counter <= goal) {
        targetWordIndex = wordIndex;
      }
    });

    const endWord = selectedLeafWords[targetWordIndex + 1];
    // return { startSec: startWord.start, endSec: endWord.end };
    return { startWord, endWord };
  } catch (error) {
    console.error('error finding times from selection:: ', error);
  }
};

export default getSelectionNodes;
