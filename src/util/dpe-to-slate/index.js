const convertDpeToSlate = (data)=>{
    const paaragraphs = data.paragraphs.map((paragraph)=>{
      const words = data.words.filter((word)=>{
        if ((word.start >= paragraph.start  ) && ( word.end <= paragraph.end  )) {
          return word
        }
      })
      const text = words.map((w)=>{return w.text}).join(' ');
      return {
        speaker: paragraph.speaker,
        start: paragraph.start,
        type: 'timedText',
        children: [{text }],
        // words: words
      }
  })

   return paaragraphs;
}

export default convertDpeToSlate;