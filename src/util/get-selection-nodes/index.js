const getSelectionNodes = (editor, selection) => {
  console.log('selection', selection);
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
    // console.log('editor.children[1]', editor.children[1]);
    // let selectedLeafWordsAnchor2 = editor.children[selectionStart.path].children[0].words;
    // console.log('selectedLeafWordsAnchor2', selectedLeafWordsAnchor2);
    selectedLeafWordsAnchor.forEach((word, wordIndex) => {
      const wordLength = (word.text + ' ').length;

      counterAnchor = counterAnchor + wordLength;
      if (counterAnchor <= goalAnchor) {
        targetWordIndexAnchor = wordIndex;
      }
    });

    const startWord = selectedLeafWordsAnchor[targetWordIndexAnchor + 1];
    console.log('startWord', startWord);
    console.log('selection', selection);

    let counter = 0;
    let goal = selectionEnd.offset;
    console.log('goal', goal);
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
    // console.log('endWord', endWord);
    // console.log('selection', selection);
    console.log('startWord', startWord);
    // const startSec = startWord.start / 1000;
    // const endSec = endWord.end / 1000;
    // console.log('startSec', startSec);
    // const selObj = window.getSelection();
    // console.log(selObj.toString());
    // setSearch(selObj.toString())
    // createUserClip(startSec, endSec);
    return { startSec: startWord.start, endSec: endWord.end };
  } catch (error) {
    console.error('error creating clip', error);
  }
};

export default getSelectionNodes;
