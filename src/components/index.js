import React, {useState, useEffect, useMemo,useCallback} from 'react';
import 'bootstrap-css-only';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import { createEditor,Editor, Node, Transforms } from 'slate';
// https://docs.slatejs.org/walkthroughs/01-installing-slate
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react';
import {
  faSave,
  faShare,
  faUndo,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  shortTimecode
} from '../util/timecode-converter';
import slateToText from '../util/export-adapters/txt';
import download from '../util/downlaod/index.js';
import convertDpeToSlate from '../util/dpe-to-slate';
import converSlateToDpe from '../util/export-adapters/slate-to-dpe/index.js';
import slateToDocx from '../util/export-adapters/docx';

import './style.css';

const PLAYBACK_RATE_VALUES  = [0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.5];
const SEEK_BACK_SEC = 15;
// const PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS = 1000;
const PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS = 500;

const videoRef = React.createRef();

const workerMessage = (event)=>{
    console.log('message received from workerFor => ', event.data);
}

const workerError = (event)=>{
  console.error('error received from workerFor => ', event);
}

export default function TranscriptEditor(props) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const editor = useMemo(() => withReact(createEditor()), []);
    // const [saveTimer, setSaveTimer] = useState(null);
    let saveTimer = null;
    const [value, setValue] = useState([])

    const handleTimeUpdated = (e) => {
        setCurrentTime(e.target.currentTime);
        // TODO: setting duration here as a workaround
        setDuration(videoRef.current.duration);
    }

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

    useEffect(()=>{
        const res = convertDpeToSlate(props.jsonData);
        setValue(res)
    },[])

    useEffect(() => { // Update the document title using the browser API
        if (videoRef && videoRef.current) {
            // setDuration(videoRef.current.duration);
            videoRef.current.addEventListener("timeupdate", handleTimeUpdated);
        }

        return function cleanup() {
            // removeEventListener
            videoRef.current.removeEventListener("timeupdate", handleTimeUpdated)
        }

    }, []);

    useEffect(() => { // Update the document title using the browser API
        if (videoRef && videoRef.current) {
          // Not working 
            setDuration(videoRef.current.duration);
        }
    },[videoRef]);

    const handleSetPlaybackRate= (e)=>{
      console.log('handleSetPlaybackRate', e.target.value)
      const tmpNewPlaybackRateValue = parseFloat( e.target.value)
      if (videoRef && videoRef.current) {
        videoRef.current.playbackRate = tmpNewPlaybackRateValue;
        setPlaybackRate(tmpNewPlaybackRateValue)
      }
    }

    const handleSeekBack = ()=>{
      if (videoRef && videoRef.current) {
        videoRef.current.currentTime = videoRef.current.currentTime - SEEK_BACK_SEC;
      }
    }

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


    const renderElement = useCallback(props => {
        switch (props.element.type) {
        // case 'speaker':
        //     return <SpeakerElement {...props} />
        case 'timedText':
            return <TimedTextElement {...props} />
          default:
            return <DefaultElement {...props} />
        }
      }, [])

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

    const DefaultElement = props => {
        return <p {...props.attributes}>{props.children}</p>
    }

    const handleTimedTextClick = (e, start)=>{
      if(e.target.classList.contains('timecode')){
        if (videoRef && videoRef.current) {
          videoRef.current.currentTime = parseInt(start);
          videoRef.current.play();
        }
      } 
    }

    const getEditorContent = ({type, speakers,timecodes })=>{
      switch(type) {
        case 'text':
         let tmpValue = value;
          if(timecodes){
            tmpValue =  handleRestoreTimecodes();
          }
          return slateToText({value:tmpValue, speakers, timecodes});
          break;
        case 'json-slate':
          return value;
          break;
        case 'json-dpe':
         return converSlateToDpe(value, props.jsonData);
           break;
        case 'word':
          let docTmpValue = value;
          if(timecodes){
            docTmpValue =  handleRestoreTimecodes();
          }
          // code block
          return slateToDocx({value:docTmpValue, speakers, timecodes, title: props.title});
          break;
        default:
          // code block
      }
    }

    const handleExport = ({type, ext, speakers,timecodes })=>{
      let editorContnet = getEditorContent({type, speakers,timecodes });
      if(ext==='json'){
        editorContnet =  JSON.stringify(editorContnet,null,2)
      }
      if(ext!=='docx'){
        download( editorContnet, `${props.title}.${ext}`);
      }
    }

    const handleSave = ()=>{
      const format = props.saveFormat? props.saveFormat: 'slate';
      const editorContnet = getEditorContent({type:`json-${format}`});
      if(props.handleSaveEditor){
        props.handleSaveEditor(editorContnet)
      }
    }

    const handleRestoreTimecodes = ()=>{
    
      const aligneDpeData = converSlateToDpe(value,props.jsonData);
      const alignedSlateData= convertDpeToSlate(aligneDpeData)
      setValue(alignedSlateData);
      return alignedSlateData;
    }
    return (
        <Container fluid style={{backgroundColor: '#eee', height: '100vh'}}>
          <h3 className={'text-truncate'} title={props.title}>{props.title}</h3>
          <br/>
            <Row>
                <Col xs={{span:12, order:1}} sm={3} md={3} lg={3} xl={4}>
                  <Row>
                  <section>
                    <video ref={videoRef}
                        src={
                            props.url
                        }
                        width={'100%'}
                        height={'auto'}
                        controls></video>
                   </section>
                  </Row>
                  <Row>
                  <Col xs={5} sm={5} md={5} lg={5} xl={5}  className={'p-1 mx-auto'}>
                    <Badge variant="light" pill>
                    <code className={'text-muted'}>{shortTimecode(currentTime)}</code><code className={'text-muted'}>{duration?` | ${shortTimecode(duration)}`: ''}</code> 
                    </Badge>
                 
                    </Col>
                  <Col xs={4} sm={4} md={4} lg={4} xl={4}  className={'p-1 mx-auto'}>
                  {/* <Form.Label>Playback Rate</Form.Label> */}
                      <Form.Control 
                        as="select" defaultValue={playbackRate}  
                        onChange={handleSetPlaybackRate}
                        title={"Change the playback speed of the player"}
                        >
                      {PLAYBACK_RATE_VALUES.map((playbackRateValue, index)=>{
                          return  <option key={index+playbackRateValue} value={playbackRateValue}>x {playbackRateValue}</option> 
                          })}  
                      </Form.Control>
                  </Col>
                  <Col xs={2} sm={2} md={2} lg={2} xl={2}  className={'p-1 mx-auto'}>
                  <Button variant="light" onClick={handleSeekBack} title={`Seek back by ${SEEK_BACK_SEC} seconds`}>{SEEK_BACK_SEC} <FontAwesomeIcon icon={faUndo}/></Button>
                  </Col>
                  </Row>
                
                </Col>
                <Col xs={{span:12, order:3}} sm={{span:7, order:2}} md={{span:7, order:2}} lg={{span:8, order:2}} xl={{span:6, order:2}}>
                
                {value.length !== 0 ?<> 
                    <section 
                    className="editor-wrapper-container"> 
                     <Slate 
                     editor={editor} 
                     value={value} 
                     onChange={(value) => {
                        if(props.handleAutoSaveEditor){
                          props.handleAutoSaveEditor(value);
                        }
                          // const content = JSON.stringify(value, null,2)
                          return  setValue(value)
                        }}
                     >
                        <Editable
                          renderElement={renderElement}
                         onKeyDown={event => {
                            console.log('Editable onKeyDown',event.key)
                            // handleEditorOnChange(event);
                            if (event.key === '`' && event.ctrlKey) {
                                event.preventDefault()
                                // Determine whether any of the currently selected blocks are code blocks.
                                const [match] = Editor.nodes(editor, {
                                  match: n => n.type === 'code',
                                })
                                // Toggle the block type depending on whether there's already a match.
                                Transforms.setNodes(
                                  editor,
                                  { type: match ? 'paragraph' : 'code' },
                                  { match: n => Editor.isBlock(editor, n) }
                                )
                              }
                          }}
                          />
                        </Slate>
                    </section>
                   </>: <section  
                            className="text-center">
                          <i className="text-center">Loading...</i>
                      </section>}

                </Col>
                <Col xs={{span:12, order:2}} sm={{span:2, order:3}} md={{span:2, order:3}} lg={{span:1, order:3}} xl={{span:2, order:3}}>
                  <Row>
                    <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                      <Button title="save" onClick={handleSave} variant="light">
                        <FontAwesomeIcon icon={ faSave } />
                      </Button>
                    </Col>
                    <Col xs={2} sm={12} md={12} lg={12} xl={12} title="export options" className={'p-1 mx-auto'}>
                      <DropdownButton id="dropdown-basic-button" title={<FontAwesomeIcon icon={ faShare } />} variant="light">
                      {/* TODO: need to run re-alignement if exportin with timecodes true, otherwise they'll be inaccurate */}
                        <Dropdown.Item onClick={()=>{handleExport({type:'text', ext:  'txt',speakers:false, timecodes: false })}}>Text </Dropdown.Item>
                        <Dropdown.Item onClick={()=>{handleExport({type:'text', ext:  'txt',speakers:true, timecodes: false })}}>Text (Speakers)</Dropdown.Item>
                        <Dropdown.Item onClick={()=>{handleExport({type: 'text',ext: 'txt', speakers:true, timecodes: true })}} disable>Text (Speakers or timecodes)</Dropdown.Item>
                         {/* TODO: need to run re-alignement if exportin with timecodes true */}
                         <Dropdown.Divider />
                          <Dropdown.Item onClick={()=>{handleExport({type:'word', ext: 'docx', speakers:false, timecodes: false})}}>Word</Dropdown.Item>
                          <Dropdown.Item onClick={()=>{handleExport({type:'word', ext: 'docx', speakers:true, timecodes: false})}}>Word (Speakers)</Dropdown.Item>
                          <Dropdown.Item onClick={()=>{handleExport({type:'word', ext: 'docx', speakers:true, timecodes: true})}}>Word (Speakers or timecodes)</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={()=>{handleExport({type:'json-slate', ext: 'json',speakers:true, timecodes: true})}}>Json (slate)</Dropdown.Item>
                        <Dropdown.Item onClick={()=>{handleExport({type:'json-dpe', ext: 'json',speakers:true, timecodes: true})}}>Json(dpe)</Dropdown.Item>
                      </DropdownButton>
                    </Col>
                    <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                      <Button title="restore timecodes, for transcript over 1hour it could temporarily freeze the UI for a few seconds"  onClick={handleRestoreTimecodes} variant="light">
                        <FontAwesomeIcon icon={ faSync } />
                      </Button>
                    </Col>
                  </Row>
                <br/>
                </Col>
            </Row>

        </Container>
    );
}
