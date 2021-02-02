function chunkParagraphs(wordsChunk, paragaph) {
  return wordsChunk.map((words, i) => {
    const wordsStartTime = words[0].start;
    // TODO: There's an issue. In the splitting between paragraphs.
    // It seems to skip the last paragraph 🤷‍♂️
    const wordsEndTime = words[words.length - 1].end;
    const paragraphs = paragaph.filter((p) => {
      return p.start >= wordsStartTime && p.end <= wordsEndTime;
      // return p.end <= wordsEndTime;
    });
    const transcript = { words, paragraphs };
    return transcript;
  });
}

export default chunkParagraphs;
