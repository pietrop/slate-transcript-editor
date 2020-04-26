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
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import ListGroup from 'react-bootstrap/ListGroup';
import Accordion from 'react-bootstrap/Accordion';
import { createEditor,Editor, Node, Transforms } from 'slate';
// https://docs.slatejs.org/walkthroughs/01-installing-slate
// Import the Slate components and React plugin.
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import {
  faSave,
  faShare,
  faUndo,
  faSync,
  faQuestionCircle
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
import restoreTimecodes from '../util/restore-timcodes';
import pluck from '../util/pluk';

import './style.css';

const PLAYBACK_RATE_VALUES  = [0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.5];
const SEEK_BACK_SEC = 15;
const PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS = 500;
const MAX_DURATION_FOR_PERFORMANCE_OPTIMIZATION_IN_SECONDS = 3600;
const TOOTLIP_DELAY = 1000;

const videoRef = React.createRef();


export default function TranscriptEditor(props) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const editor = useMemo(() => withReact(createEditor()), []);
    const [value, setValue] = useState([]);
    const [showSpeakers, setShowSpeakers] = useState(true);
    const [showTimecodes, setShowTimecodes] = useState(true);
    // const [speakerOptions, setSpeakerOptions] = useState([]);

    useEffect(()=>{
    
        const res = convertDpeToSlate(props.jsonData);
        setValue(res);

    },[])

  //   useEffect(()=>{
  //     const getUniqueSpeakers = pluck('speaker')
  //     const uniqueSpeakers = getUniqueSpeakers(props.jsonData.paragraphs)
  //     setSpeakerOptions(uniqueSpeakers);
  // },[])

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
            if(videoRef.current.duration>=MAX_DURATION_FOR_PERFORMANCE_OPTIMIZATION_IN_SECONDS){
              setShowSpeakers(false);
              showTimecodes(false);
            }
        }
    },[videoRef]);

    const handleTimeUpdated = (e) => {
      setCurrentTime(e.target.currentTime);
      // TODO: setting duration here as a workaround
      setDuration(videoRef.current.duration);
  }

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

    const renderElement = useCallback((props, value) => {
      console.log('renderElement', value)
      console.log('renderElement props', props)
        switch (props.element.type) {
        // case 'speaker':
        //     return <SpeakerElement {...props} />
        case 'timedText':
            return <TimedTextElement {...props} value={value} />
          default:
            return <DefaultElement {...props} />
        }
      }, [])

    const renderLeaf = useCallback(({ attributes, children, leaf }) => {
      // console.log(attributes, children, leaf)
      return (
        <span
        onDoubleClick={handleTimedTextClick}
        className={'timecode text'}
        data-start={children.props.parent.start}
        title={children.props.parent.start}
          {...attributes}
          // style={{
          //   fontWeight: leaf.bold ? 'bold' : 'normal',
          //   fontStyle: leaf.italic ? 'italic' : 'normal',
          // }}
        >
          {children}
        </span>
      )
    }, [])

    const TimedTextElement = props => {
      console.log('TimedTextElement',props, props.value);

      const path = ReactEditor.findPath(editor, props.element);
      const handleSetSpeakerName = (e)=>{
        console.log('handleSetSpeakerName', e)
        const oldSpeakerName = props.element.speaker.toUpperCase();
        const newSpeakerName = prompt('Change speaker name', e.target.innerText);
        if(newSpeakerName){
          const isUpdateAllSpeakerInstances = confirm(`Would you like to replace all occurrences of ${oldSpeakerName} with ${newSpeakerName}?`);
          if(isUpdateAllSpeakerInstances){
            console.log('value 1', props.value)
            // TODO: move as separate function - update all speaker
           const newValue = props.value.map((paragraph)=>{
              if(paragraph.speaker === oldSpeakerName){
                paragraph.speaker = newSpeakerName;
              }
              return paragraph;
            })
            console.log('value 2',newValue)
            setValue(newValue)
          }
          else{
            Transforms.setNodes(editor, 
              {type:'timedText',speaker: newSpeakerName, start: props.element.start}, {at: path}
            );    
          }
        }
      }

      // console.log('Node.get',Node.get(props))
        return (
          <Row {...props.attributes}>
              {showTimecodes 
              && <Col contentEditable={false}  xs={4} sm={2} md={4} lg={3} xl={2} className={'p-t-2 text-truncate'} >
              <code 
                  contentEditable={false}  
                  style={{cursor: 'pointer'}} 
                  className={'timecode text-muted unselectable'} 
                  onClick={handleTimedTextClick}
                  title={props.element.startTimecode}
                  data-start={props.element.start}
                  >
                    {props.element.startTimecode}
                  </code>
                  </Col>}
                  {showSpeakers 
                  &&   <Col contentEditable={false}  xs={8} sm={10} md={8} lg={3} xl={3} className={'p-t-2 text-truncate'} >
                  <span 
                    contentEditable={false}  
                    className={'text-truncate text-muted unselectable'}
                    style={{
                      cursor: 'pointer',
                      width: '100%'
                    }} 
                    title={props.element.speaker.toUpperCase()}
                    onClick={handleSetSpeakerName}
                    > {props.element.speaker.toUpperCase()}</span>

              </Col>}
              <Col  xs={12} sm={12} md={12} lg={6} xl={7} className={'p-b-1 mx-auto'}>
              {props.children} 
              </Col>
              </Row>
        )
      }

    const DefaultElement = props => {
        return <p {...props.attributes}>{props.children}</p>
    }



    const handleTimedTextClick = (e)=>{
      // console.log(e, e.target)
      console.log(e)
      if(e.target.classList.contains('timecode')){
      
        const start = e.target.dataset.start;
        if (videoRef && videoRef.current) {
          videoRef.current.currentTime = parseInt(start);
          videoRef.current.play();
        }
      }else if(e.target.dataset.slateString){
        if(e.target.parentNode.dataset.start){
          const start = e.target.parentNode.dataset.start;
          console.log(start);
          if (videoRef && videoRef.current && start) {
            videoRef.current.currentTime = parseInt(start);
            videoRef.current.play();
          }

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
      const alignedSlateData = restoreTimecodes({slateValue: value,jsonData: props.jsonData})
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
                        controls 
                        playsinline></video>
                   </section>
                  </Row>
                  <Row>
                  <Col xs={5} sm={5} md={5} lg={5} xl={5}  className={'p-1 mx-auto'}>
                    <Badge variant="light" pill>
                    <code className={'text-muted'}>{shortTimecode(currentTime)}</code><code className={'text-muted'}>{duration?` | ${shortTimecode(duration)}`: ''}</code> 
                    </Badge>
                 
                    </Col>
                  <Col xs={4} sm={4} md={4} lg={4} xl={4}  className={'p-1 mx-auto'}>
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
                  <OverlayTrigger delay={TOOTLIP_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                 { `Seek back by ${SEEK_BACK_SEC} seconds`}
                    </Tooltip>}>
                      <span className="d-inline-block">
                      <Button variant="light" onClick={handleSeekBack}
                      //  title={`Seek back by ${SEEK_BACK_SEC} seconds`}
                       >{SEEK_BACK_SEC} <FontAwesomeIcon icon={faUndo}/></Button>
                      </span>
                    </OverlayTrigger>
                  </Col>
                  </Row>
                  <Row>
                   
                  {/* <Col xs={12} sm={12} md={12} lg={12} xl={12}  className={'p-1 mx-auto'}>
                      <Accordion>
                        <Accordion.Toggle as={Button} variant="link" eventKey="0">
                          <Badge variant="light">Speakers</Badge>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                          <ListGroup>
                          {speakerOptions.map((speakerName)=>{
                            return <ListGroup.Item className={'text-truncate'} title={speakerName.toUpperCase()}>{speakerName.toUpperCase()}</ListGroup.Item>
                          })}
                          </ListGroup>
                        </Accordion.Collapse>
                      </Accordion>
                    </Col> */}
                  </Row>
                
                </Col>
                <Col xs={{span:12, order:3}} sm={{span:7, order:2}} md={{span:7, order:2}} lg={{span:8, order:2}} xl={{span:6, order:2}}>
                
                {value.length !== 0 ?<> 
                    <section className="editor-wrapper-container"> 
                    <style scoped>
                    {`
                    .timecode[data-start^="${parseInt(currentTime)}"]{
                      color: #343a40!important /* Bootstrap black, for dark */
                    }

                    .timecode:not([data-start^="${parseInt(currentTime)}"]){
                      color: #6c757d; /*Bootstrap grey for secondary*/
                    }                    
                    `}
                  </style>

                     <Slate 
                     editor={editor} 
                     value={value} 
                    //  onClick={(e)=>{console.log('click',e)}}
                    //  onChange={value => setValue(value)}
                     onChange={(value) => {
                        if(props.handleAutoSaveEditor){
                          props.handleAutoSaveEditor(value);
                        }
                          // const content = JSON.stringify(value, null,2)
                          return  setValue(value)
                        }}
                     >
                        <Editable
                        //  onClick={(e)=>{console.log('click',e.target)}}
                          // renderElement={renderElement.bind( value)}
                          renderElement={(e) => renderElement(e, value)}
                          renderLeaf={renderLeaf}
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
                  <OverlayTrigger  placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                    Double click on a word to jump to that paragraph!
                    </Tooltip>}>
                      <span className="d-inline-block">
                        <Button variant="light" style={{ pointerEvents: 'none' }}>
                        <FontAwesomeIcon icon={ faQuestionCircle } />
                        </Button>
                      </span>
                    </OverlayTrigger>

                    </Col>
                    <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                      {/* <OverlayTrigger  placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                      Save
                    </Tooltip>}>
                      <span className="d-inline-block"> */}
                      <Button title="save" onClick={handleSave} variant="light">
                        <FontAwesomeIcon icon={ faSave } />
                      </Button>
                      {/* </span>
                    </OverlayTrigger> */}
                    </Col>
                    <Col xs={2} sm={12} md={12} lg={12} xl={12} 
                    title="export options"
                     className={'p-1 mx-auto'}>
                      <DropdownButton id="dropdown-basic-button" title={<FontAwesomeIcon icon={ faShare } />} variant="light">
                      {/* TODO: need to run re-alignement if exportin with timecodes true, otherwise they'll be inaccurate */}
                        <Dropdown.Item onClick={()=>{handleExport({type:'text', ext:  'txt',speakers:false, timecodes: false })}}>Text <code>.txt</code></Dropdown.Item>
                        <Dropdown.Item onClick={()=>{handleExport({type:'text', ext:  'txt',speakers:true, timecodes: false })}}>Text (Speakers)</Dropdown.Item>
                        <Dropdown.Item onClick={()=>{handleExport({type: 'text',ext: 'txt', speakers:true, timecodes: true })}} disable>Text (Speakers & timecodes)</Dropdown.Item>
                         {/* TODO: need to run re-alignement if exportin with timecodes true */}
                         <Dropdown.Divider />
                          <Dropdown.Item onClick={()=>{handleExport({type:'word', ext: 'docx', speakers:false, timecodes: false})}}>Word <code>.docx</code></Dropdown.Item>
                          <Dropdown.Item onClick={()=>{handleExport({type:'word', ext: 'docx', speakers:true, timecodes: false})}}>Word (Speakers)</Dropdown.Item>
                          <Dropdown.Item onClick={()=>{handleExport({type:'word', ext: 'docx', speakers:true, timecodes: true})}}>Word (Speakers & timecodes)</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={()=>{handleExport({type:'json-slate', ext: 'json',speakers:true, timecodes: true})}}>Json (slate)</Dropdown.Item>
                        <Dropdown.Item onClick={()=>{handleExport({type:'json-dpe', ext: 'json',speakers:true, timecodes: true})}}>Json(dpe)</Dropdown.Item>
                      </DropdownButton>
        
                    </Col>
                    <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                    <OverlayTrigger delay={TOOTLIP_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                    Restore timecodes. At the moment for transcript over 1hour it could temporarily freeze the UI for a few seconds
                    </Tooltip>}>
                      <span className="d-inline-block">

                     <Button 
                    //  title="restore timecodes, for transcript over 1hour it could temporarily freeze the UI for a few seconds" 
                      onClick={handleRestoreTimecodes} variant="light">
                        <FontAwesomeIcon icon={ faSync } />
                      </Button>
                      </span>
                    </OverlayTrigger>
                   
                    </Col>
                  </Row>
                <br/>
                </Col>
            </Row>

        </Container>
    );
}
