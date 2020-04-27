# notes

```text
// const playVideo = ()=>{
//   console.log('playVideo')
//   if (videoRef && videoRef.current) {
//     videoRef.current.play()
//   }
// }

// const handleEditorOnChange = (e)=>{
  // if( e.key!== 'Tab' 
  //   && e.key!== 'Shift'
  //   && e.key!== 'Enter' 
  //   ){
  //     if (videoRef && videoRef.current) {
  //       // https://lodash.com/docs/4.17.15#debounce
  //       // https://lodash.com/docs/4.17.15#throttle
  //         videoRef.current.pause();
  //         // throttle(playVideo, PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS, {trailing: true})
  //         once(playVideo)
  //     }
  // }
// }

    // useEffect(()=>{
//     // resolved relative to main.js url path
//     const workerFor = new Worker('web-worker.js');
//     // listen to message event of worker
//     workerFor.addEventListener('message', workerMessage);
//     // listen to error event of worker
//     workerFor.addEventListener('error', workerError);

//     return function cleanupWorkers() {
//       workerFor.removeEventListener("error",workerMessage )
//       workerFor.removeEventListener("message", workerError)
//     }

// },[])

----
    const TimedTextElement = props => {
  // console.log('TimedTextElement',props)
  const handleSetSpeakerName = (e)=>{
    const resp = prompt('Change speaker name', props.element.speaker)
    const path = editor.selection.anchor.path;
    console.log('path',path)
    if(resp){
      Transforms.setNodes(
        editor,
        { speaker: resp },
        {
          match: n => Editor.isBlock(editor, n),
        }
      )
    }

  }
    return (
      <Row {...props.attributes} >
          <Col xs={4} sm={2} md={4} lg={3} xl={2} className={'p-t-2 text-truncate'} >
          <code 
              style={{cursor: 'pointer'}} 
              className={['timecode', 'text-muted'].join(' ')}  
              onClick={(e)=>{handleTimedTextClick(e, props.element.start)}}
              title={shortTimecode(props.element.start)}
              >{shortTimecode(props.element.start)}
              </code>
              </Col>
              <Col xs={8} sm={10} md={8} lg={3} xl={3} className={'p-t-2 text-truncate'} >
              <strong 
                className={'text-truncate'}
                style={{
                  cursor: 'pointer',
                  width: '100%'
                }} 
                title={props.element.speaker.toUpperCase()}
                onClick={handleSetSpeakerName}> {props.element.speaker.toUpperCase()}</strong>
          </Col>
          <Col  xs={12} sm={12} md={12} lg={6} xl={7} className={'p-b-1 mx-auto'}>
          {props.children} 
          </Col>
          </Row>
    )
  }
```

