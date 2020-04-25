  // we get all words inside the blocks before the current one
  // and add them to the attribute data prev-time
  // to do css injection to show current paragraph positioning in text
 const getWordTimingsBeforeCurrentParagraph = (blocksAsArray, currentBlockIndex)=>{
    // const blockId = block.getKey();
        // const currentContent = this.props.blockProps.editorState.getCurrentContent();
        // const blocksAsArray = currentContent.getBlocksAsArray();
        // const currentBlockIndex = blocksAsArray.findIndex((block)=>{
        //   return  blockId=== block.getKey()
        // }) 
    
        const blocksBeforeCurrentBlock = blocksAsArray.slice(0,currentBlockIndex);
        const wordsTimingBefore = blocksBeforeCurrentBlock.map((block)=>{
          return block.start;
        })
        // const wordsBeforeFlatten = wordsBefore.flat(2);
        // return wordsBeforeFlatten;
        return wordsTimingBefore;
  }

  export default  getWordTimingsBeforeCurrentParagraph;