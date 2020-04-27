import React, {useState, useEffect, useMemo,useCallback} from 'react';
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
import { withHistory } from 'slate-history';
import {
  faSave,
  faShare,
  faUndo,
  faSync,
  faInfoCircle,
  faICursor,
  faMehBlank,
  faPause,
  faMusic,
  faClosedCaptioning
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
import subtitlesGenerator from '../util/export-adapters/subtitles-generator/index.js';
import subtitlesExportOptionsList from '../util/export-adapters/subtitles-generator/list.js';

const PLAYBACK_RATE_VALUES  = [0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.5];
const SEEK_BACK_SEC = 15;
const PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS = 1500;
const MAX_DURATION_FOR_PERFORMANCE_OPTIMIZATION_IN_SECONDS = 3600;
const TOOTLIP_DELAY = 1000;
const TOOTLIP_LONGER_DELAY = 2000;

const videoRef = React.createRef();

export default function SlateTranscriptEditor(props) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const editor = useMemo(() => withReact(withHistory(createEditor())), []);
    const [value, setValue] = useState([]);
    const defaultShowSpeakersPreference = (typeof props.showSpeakers === 'boolean')? props.showSpeakers : true;
    const defaultShowTimecodesPreference = (typeof props.showTimecodes === 'boolean')? props.showTimecodes : true;
    const [showSpeakers, setShowSpeakers] = useState(defaultShowSpeakersPreference);
    const [showTimecodes, setShowTimecodes] = useState(defaultShowTimecodesPreference);
    const [speakerOptions, setSpeakerOptions] = useState([]);
    const [showSpeakersCheatShet, setShowSpeakersCheatShet] = useState(false);
    const [saveTimer, setSaveTimer] = useState(null);
    const [isPauseWhiletyping, setIsPauseWhiletyping] = useState(false);

    useEffect(()=>{
        const res = convertDpeToSlate(props.jsonData);
        setValue(res);
    },[])

    useEffect(()=>{
      console.log('getUniqueSpeakers')
      const getUniqueSpeakers = pluck('speaker');
      const uniqueSpeakers = getUniqueSpeakers(value);
      setSpeakerOptions(uniqueSpeakers);
  },[showSpeakersCheatShet])

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

    const handleSetShowSpeakersCheatShet = ()=>{
       setShowSpeakersCheatShet(!showSpeakersCheatShet)
    }

    const handleTimeUpdated = (e) => {
      setCurrentTime(e.target.currentTime);
      // TODO: setting duration here as a workaround
      setDuration(videoRef.current.duration);
  }

    const handleSetPlaybackRate= (e)=>{
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

    const renderElement = useCallback((props) => {
        switch (props.element.type) {
        case 'timedText':
            return <TimedTextElement {...props} />
          default:
            return <DefaultElement {...props} />
        }
      }, [])

    const renderLeaf = useCallback(({ attributes, children, leaf }) => {
      return (
        <span
        onDoubleClick={handleTimedTextClick}
        className={'timecode text'}
        data-start={children.props.parent.start}
        data-previous-timings={children.props.parent.previousTimings}
        title={children.props.parent.start}
          {...attributes}
        >
          {children}
        </span>
      )
    }, [])


    // 

    /**
     * `handleSetSpeakerName` is outside of TimedTextElement 
     * to improve the overall performance of the editor, 
     * especially on long transcripts 
     * @param {*} element - props.element, from `renderElement` function 
     */
    const handleSetSpeakerName = (element)=>{
      const pathToCurrentNode = ReactEditor.findPath(editor, element);
      const oldSpeakerName = element.speaker.toUpperCase();
      const newSpeakerName = prompt('Change speaker name', oldSpeakerName);
      if(newSpeakerName){
        const isUpdateAllSpeakerInstances = confirm(`Would you like to replace all occurrences of ${oldSpeakerName} with ${newSpeakerName}?`);
        if(isUpdateAllSpeakerInstances){
          const rangeForTheWholeEditor =  Editor.range(editor, []);
          // Apply transformation to the whole doc, where speaker matches old spekaer name, and set it to new one 
          Transforms.setNodes(
            editor,
            {type:'timedText',speaker: newSpeakerName},
            {
              at: rangeForTheWholeEditor,
              match: (node) => ((node.type==="timedText") && (node.speaker === oldSpeakerName))
            }
          )
        }
        else{
          // only apply speaker name transformation to current element
          Transforms.setNodes(editor, 
            {type:'timedText',speaker: newSpeakerName}, 
            { at: pathToCurrentNode }
          );    
        }
      }  
    }

    const TimedTextElement = props => {
        let textLg = 12;
        let textXl = 12;
        if(!showSpeakers && !showTimecodes){
          textLg = 12
          textXl = 12
        }else if (showSpeakers && !showTimecodes){
          textLg = 9
          textXl = 9
        }else if (!showSpeakers && showTimecodes ){
          textLg = 9
          textXl = 10
        }else if(showSpeakers && showTimecodes){
          textLg = 6 
          textXl = 7
        }

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
                    onClick={handleSetSpeakerName.bind(this, props.element)}
                    > {props.element.speaker.toUpperCase()}</span>
              </Col>}
              <Col  xs={12} sm={12} md={12} lg={textLg} xl={textXl} className={'p-b-1 mx-auto'}>
              {props.children} 
              </Col>
              </Row>
        )
      }

    const DefaultElement = props => {
        return <p {...props.attributes}>{props.children}</p>
    }

    const handleTimedTextClick = (e)=>{
      if(e.target.classList.contains('timecode')){
      
        const start = e.target.dataset.start;
        if (videoRef && videoRef.current) {
          videoRef.current.currentTime = parseInt(start);
          videoRef.current.play();
        }
      }else if(e.target.dataset.slateString){
        if(e.target.parentNode.dataset.start){
          const start = e.target.parentNode.dataset.start;
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
        case 'json-slate':
          return value;
        case 'json-dpe':
         return converSlateToDpe(value, props.jsonData);
        case 'word':
          let docTmpValue = value;
          if(timecodes){
            docTmpValue =  handleRestoreTimecodes();
          }
          return slateToDocx({value:docTmpValue, speakers, timecodes, title: props.title});
        default:
          // some default, unlikely to be called
          return {};
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

    const breakParagraph = () =>{
      Editor.insertBreak(editor)
    }
    const insertTextInaudible = () =>{
      Transforms.insertText(editor, '[INAUDIBLE]');
    }

    // const handleInsertMusicNote = ()=>{
    //   Transforms.insertText(editor, '♫'); // or ♪
    // }

    /**
     * See explanation in `src/utils/dpe-to-slate/index.js` for how this function works with css injection
     * to provide current paragaph's highlight.
     * @param {Number} currentTime - float in seconds
     */
    const generatePreviousTimingsUpToCurrent = (currentTime)=>{
      const lastWordStartTime = props.jsonData.words[props.jsonData.words.length-1].start;
      const lastWordStartTimeInt = parseInt(lastWordStartTime);
      const emptyListOfTimes = Array(lastWordStartTimeInt);
      const listOfTimesInt = [...emptyListOfTimes.keys()]
      const listOfTimesUpToCurrentTimeInt =  listOfTimesInt.splice(0, currentTime,0)
      const stringlistOfTimesUpToCurrentTimeInt  = listOfTimesUpToCurrentTimeInt.join(' ');
      return stringlistOfTimesUpToCurrentTimeInt;
    }

    const handleSetPauseWhileTyping = ()=>{
      setIsPauseWhiletyping(!isPauseWhiletyping)
    }

    const handleSubtitlesExport = ({type, ext})=>{
      let editorContnet = getEditorContent({type:'json-dpe', speakers:true, timecodes:true });
      console.log('editorContnet',editorContnet)
      const subtitlesJson = subtitlesGenerator({ words: editorContnet.words, type });
      console.log('subtitlesJson',subtitlesJson)
      download( subtitlesJson, `${props.title}.${ext}`);
    }

    return (
        <Container fluid style={{backgroundColor: '#eee', height: '100vh', paddingTop: '1em'}}>
          <style scoped>
          {`
              /* Next words */
              .timecode[data-previous-timings*="${videoRef && videoRef.current&& videoRef.current.duration&&  generatePreviousTimingsUpToCurrent(parseInt(currentTime))}"]{
                  color:  #9E9E9E;
              }
          `}
          </style>
          <style scope>
            {`.editor-wrapper-container{
                padding: 8px 16px;
                background: #f9f9f9;
                box-shadow: 0 0 10px #ccc;
                height: 90vh;
                overflow: auto;
              }
              /* https://developer.mozilla.org/en-US/docs/Web/CSS/user-select
              TODO: only working in Chrome, not working in Firefox, and Safari - OSX
              if selecting text, not showing selection
              Commented out because it means cannot select speakers and timecode anymore
              which is the intended default behavior but needs to come with export
              functionality to export as plain text, word etc.. otherwise user won't be able
              to get text out of component with timecodes and speaker names in the interim */
              .unselectable {
                -moz-user-select: none;
                -webkit-user-select: none;
                -ms-user-select: none;
                user-select: none;
              }
              .timecode:hover{
                text-decoration: underline;
              }
              .timecode.text:hover{
                text-decoration:none;
              }
              `}
                        </style>
            {props.showTitle?  <OverlayTrigger  delay={TOOTLIP_LONGER_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled"> {props.title}</Tooltip>}>
                  <h3 className={'text-truncate text-left'}><small className="text-muted">{props.title}</small></h3> 
              </OverlayTrigger> :  null}
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
                        playsInline></video>
                   </section>
                  </Row>
                  <Row>
                  <Col xs={5} sm={4} md={4} lg={4} xl={4}  className={'p-1 mx-auto'}>
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
                  <Col xs={3} sm={3} md={3} lg={3} xl={3}  className={'p-1 mx-auto'}>
                  <OverlayTrigger delay={TOOTLIP_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                 { `Seek back by ${SEEK_BACK_SEC} seconds`}
                    </Tooltip>}>
                      <span className="d-inline-block">
                      <Button variant="light" onClick={handleSeekBack}
                      block
                       >{SEEK_BACK_SEC} <FontAwesomeIcon icon={faUndo}/></Button>
                      </span>
                    </OverlayTrigger>
                  </Col>
                  </Row>
                  <Row>
                  <Col xs={12} sm={12} md={12} lg={12} xl={12}  className={'p-1 mx-auto'}>
                      <Accordion onClick={handleSetShowSpeakersCheatShet}>
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
                    </Col>
                  </Row>
                
                </Col>
                <Col xs={{span:12, order:3}} sm={{span:7, order:2}} md={{span:7, order:2}} lg={{span:8, order:2}} xl={{span:6, order:2}}>
                
                {value.length !== 0 ?<> 
                    <section className="editor-wrapper-container"> 
                     <Slate 
                      editor={editor} 
                      value={value} 
                      onChange={(value) => {
                          if(props.handleAutoSaveEditor){
                            props.handleAutoSaveEditor(value);
                          }
                            return  setValue(value)
                          }}
                      >
                        <Editable
                          renderElement={renderElement}
                          renderLeaf={renderLeaf}
                          onKeyDown={event => {
                            if(isPauseWhiletyping){
                              // logic for pause while typing 
                              // https://schier.co/blog/wait-for-user-to-stop-typing-using-javascript
                              // TODO: currently eve the video was paused, and pause while typing is on,
                              // it will play it when stopped typing. so added btn to turn feature on off. 
                              // and disabled as default. 
                              // also pause while typing might introduce performance issues on longer transcripts
                              // if on every keystroke it's creating and destroing a timer. 
                              // should find a more efficient way to "debounce" or "throttle" this functionality 
                              if(videoRef && videoRef.current){
                                videoRef.current.pause();
                              }

                              if (saveTimer !== null) {
                                clearTimeout(saveTimer);
                              }
                        
                              const tmpSaveTimer = setTimeout(() => {
                                if(videoRef && videoRef.current){
                                  videoRef.current.play();
                                }
                              }, PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS);
                                setSaveTimer(tmpSaveTimer)
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
                          <OverlayTrigger OverlayTrigger delay={TOOTLIP_LONGER_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                        Export options
                      </Tooltip>}>
                        <span className="d-inline-block">
                        <DropdownButton id="dropdown-basic-button" title={<FontAwesomeIcon icon={ faShare } />} variant="light">
                        {/* TODO: need to run re-alignement if exportin with timecodes true, otherwise they'll be inaccurate */}
                          <Dropdown.Item onClick={()=>{handleExport({type:'text', ext:  'txt',speakers:false, timecodes: false })}}>Text (<code>.txt</code>)</Dropdown.Item>
                          <Dropdown.Item onClick={()=>{handleExport({type:'text', ext:  'txt',speakers:true, timecodes: false })}}>Text (Speakers)</Dropdown.Item>
                          <Dropdown.Item onClick={()=>{handleExport({type: 'text',ext: 'txt', speakers:true, timecodes: true })}} disable>Text (Speakers & timecodes)</Dropdown.Item>
                          {/* TODO: need to run re-alignement if exportin with timecodes true */}
                          <Dropdown.Divider />
                            <Dropdown.Item onClick={()=>{handleExport({type:'word', ext: 'docx', speakers:false, timecodes: false})}}>Word (<code>.docx</code>)</Dropdown.Item>
                            <Dropdown.Item onClick={()=>{handleExport({type:'word', ext: 'docx', speakers:true, timecodes: false})}}>Word (Speakers)</Dropdown.Item>
                            <Dropdown.Item onClick={()=>{handleExport({type:'word', ext: 'docx', speakers:true, timecodes: true})}}>Word (Speakers & timecodes)</Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={()=>{handleExport({type:'json-slate', ext: 'json',speakers:true, timecodes: true})}}>SlateJs (<code>.json</code>)</Dropdown.Item>
                          <Dropdown.Item onClick={()=>{handleExport({type:'json-dpe', ext: 'json',speakers:true, timecodes: true})}}>DPE (<code>.json</code>)</Dropdown.Item>
                        </DropdownButton>
                        </span>
                      </OverlayTrigger>
                    </Col>
                      <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                          <OverlayTrigger OverlayTrigger delay={TOOTLIP_LONGER_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                        Export in caption format
                      </Tooltip>}>
                  
                        <DropdownButton  id="dropdown-basic-button" title={<FontAwesomeIcon icon={ faClosedCaptioning } />} variant="light">

                          {subtitlesExportOptionsList.map(({type,label, ext})=>{
                            return <Dropdown.Item onClick={()=>{handleSubtitlesExport({type, ext})}}>{label} (<code>.{ext}</code>)</Dropdown.Item>
                          })}
                        </DropdownButton>
                      </OverlayTrigger>
                    </Col>
                    <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                      <OverlayTrigger OverlayTrigger delay={TOOTLIP_LONGER_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                        Save
                      </Tooltip>}>
                        <Button onClick={handleSave} variant="light">
                          <FontAwesomeIcon icon={ faSave } />
                        </Button>
                      </OverlayTrigger>
                      </Col>
                    <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                      <OverlayTrigger delay={TOOTLIP_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                        To insert a paragraph break, and split a pargraph in two, put the cursor at a point where you'd want to add a paragraph break in the text and either click this button or hit enter key
                      </Tooltip>}>
                      <Button 
                          onClick={breakParagraph} variant="light">
                          {/* <FontAwesomeIcon icon={ faICursor } /> */}
                          ↵
                        </Button>
                      </OverlayTrigger>
                    </Col>
                    <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                      <OverlayTrigger delay={TOOTLIP_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                      Put the cursor at a point where you'd want to add [INAUDIBLE] text, and click this button
                      </Tooltip>}>
                        <Button onClick={insertTextInaudible} variant="light">
                          <FontAwesomeIcon icon={ faMehBlank } />
                        </Button>
                      </OverlayTrigger>
                    </Col>
                    <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                      <OverlayTrigger delay={TOOTLIP_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                    Turn {isPauseWhiletyping? 'off' : 'on'} pause while typing functionality. As you start typing the media while pause playback until you stop. Not reccomended on longer transcript as it might present performance issues.
                      </Tooltip>}>
                      <Button onClick={handleSetPauseWhileTyping} variant={isPauseWhiletyping? 'secondary': 'light'}>
                          <FontAwesomeIcon icon={ faPause }  />
                        </Button>
                      </OverlayTrigger>
                      </Col>
                      <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                      <OverlayTrigger delay={TOOTLIP_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                      Restore timecodes. At the moment for transcript over 1hour it could temporarily freeze the UI for a few seconds
                      </Tooltip>}>
                      <Button onClick={handleRestoreTimecodes} variant="light">
                          <FontAwesomeIcon icon={ faSync } />
                        </Button>
                      </OverlayTrigger>
                    </Col>
                      <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                      <OverlayTrigger  placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                        Double click on a paragraph to jump to the corresponding point at the beginning of that paragraph in the media
                        </Tooltip>}>
                          {/* <span className="d-inline-block"> */}
                            <Button variant="light">
                            <FontAwesomeIcon icon={ faInfoCircle } />
                            </Button>
                          {/* </span> */}
                        </OverlayTrigger>
                        </Col>
                      {/* <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
                      <OverlayTrigger delay={TOOTLIP_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled">
                         Insert a ♫ in the text
                      </Tooltip>}>
                        <span className="d-inline-block">
                      <Button 
                        onClick={handleInsertMusicNote} variant={'light'}>
                          <FontAwesomeIcon icon={ faMusic }  /> 
                        </Button>
                        </span>
                      </OverlayTrigger>
                    </Col> */}
                  </Row>
                <br/>
                </Col>
            </Row>
        </Container>
    );
}
