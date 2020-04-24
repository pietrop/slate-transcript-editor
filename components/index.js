import React, {useState, useEffect, useMemo,useCallback} from 'react';
import 'bootstrap-css-only';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { createEditor,Editor, Node, Transforms } from 'slate';
// https://docs.slatejs.org/walkthroughs/01-installing-slate
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react';
import {
  faCog,
  faKeyboard,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './style.css';

  // https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
  const download = (content, filename, contentType) => {
    const type = contentType || "application/octet-stream";
    const link = document.createElement("a");
    const blob = new Blob([content], { type: type });

    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    // Firefox fix - cannot do link.click() if it's not attached to DOM in firefox
    // https://stackoverflow.com/questions/32225904/programmatical-click-on-a-tag-not-working-in-firefox
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

// https://docs.slatejs.org/walkthroughs/06-saving-to-a-database
// Define a serializing function that takes a value and returns a string.
const serialize = value => {
    return (
      value
        // Return the string content of each paragraph in the value's children.
        .map(n => Node.string(n))
        // Join them all with line breaks denoting paragraphs.
        .join('\n')
    )
  }
  
  // Define a deserializing function that takes a string and returns a value.
  const deserialize = string => {
    // Return a value array of children derived by splitting the string.
    return string.split('\n').map(line => {
      return {
        children: [{ text: line }],
      }
    })
  }
// TODO: 
  const slateToText = value => {
    return (
      value
        // Return the string content of each paragraph in the value's children.
        .map(n => {
          return `${n.start} ${n.speaker}\n${Node.string(n)})` //+ Node.get('start', 'start');
        })
        // Join them all with line breaks denoting paragraphs.
        .join('\n\n')
    )
  }

  const slateToTextNoSpeakers = value => {
    return (
      value
        // Return the string content of each paragraph in the value's children.
        .map(n => Node.string(n))
        // Join them all with line breaks denoting paragraphs.
        .join('\n')
    )
  }
  




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
        words: words
      }
  })

   return paaragraphs;
}
const videoRef = React.createRef();

export default function TranscriptEditor(props) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const editor = useMemo(() => withReact(createEditor()), [])

    const [value, setValue] = useState([])
        // {
        //     type: 'speaker',
        //     start: 15,
        //     children: [
        //         { text: 'UKN_N'}
        //       ],
        // },
      //   {
      //       start: 15,
      //       speaker: 'UKN_N',
      //       type: 'timedText',
      //       children: [
      //           { text: 'There is a day.' }
      //         ],
            
      //   }
      // ])

    const handleTimeUpdated = (e) => {
        setCurrentTime(e.target.currentTime)
    }

    useEffect(()=>{
        const res = convertDpeToSlate(props.jsonData);
        setValue(res)
    },[])

    useEffect(() => { // Update the document title using the browser API
        if (videoRef && videoRef.current) {
            setDuration(videoRef.current.duration);
            videoRef.current.addEventListener("timeupdate", handleTimeUpdated);
        }

        return function cleanup() {
            removeEventListener
            videoRef.current.removeEventListener("timeupdate", handleTimeUpdated)
        }

    }, []);

    useEffect(() => { // Update the document title using the browser API
        if (videoRef && videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    },[videoRef]);

    const handleEditorchange = (newEditorState)=>{
        if (editorState.getCurrentContent() !== newEditorState.getCurrentContent()) {
            setEditorState(newEditorState);
        }
    }

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
    return (
      <Row {...props.attributes} >
          <Col xs={12} sm={3} md={3} lg={3} xl={3}>
          <code 
                    style={{cursor: 'pointer'}} 
                    className={['timecode'].join(' ')}  
                    onClick={(e)=>{handleTimedTextClick(e, props.element.start)}}>
                    {props.element.start}</code><strong> {props.element.speaker}</strong>
          </Col>
          <Col  xs={12} sm={7} md={7} lg={7} xl={7}>
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

    const handleExport = (type)=>{
      const textExt = 'txt';
      switch(type) {
        case 'text':
          download(slateToText(value), `${props.title}.${textExt}`);
          break;
        case 'text-no-speakers':
          download(slateToTextNoSpeakers(value), `${props.title}.${textExt}`);
          break;
        case 'json-slate':
          download( JSON.stringify(value,null,2), `${props.title}.${type}`);
          break;
        case 'json-dpe':
          download( JSON.stringify(value,null,2), `${props.title}.${type}`);
           break;
        case 'word':
          // code block
          break;
        default:
          // code block
      }

  
    }

    return (
        <Container fluid style={{backgroundColor: '#eee', height: '100vh'}}>
          <br/>
            <Row>
                <Col xs={12} sm={3} md={3} lg={3} xl={4}>
                <section 
                // style={{ marginTop: '5vh' }}
                >
                    <video ref={videoRef}
                        src={
                            props.url
                        }
                        width={'100%'}
                        height={'auto'}
                        controls></video>
                   </section>
                </Col>
                <Col s={12} sm={7} md={7} lg={7} xl={6}>
                
                {value.length !== 0 ?<> 
                    <section 
                    className="editor-wrapper-container" 
                    style={{
                        //  marginTop: '5vh',
                        // height: '90vh' 
                    }}> 
                     <Slate 
                     editor={editor} 
                     value={value} 
                     onChange={(value) => {
                        // const content = JSON.stringify(value, null,2)
                        return  setValue(value)
                        }}
                     >
                        <Editable
                          renderElement={renderElement}
                         onKeyDown={event => {
                            console.log(event.key)
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
                            className="text-center"
                            style={{
                                // marginTop: '5vh',
                                // height: '90vh' 
                            }}>
                          <i className="text-center">Loading...</i>
                      </section>}

                </Col>
                <Col xs={12} sm={2} md={2} lg={2} xl={2}>
                {/* <Button onClick={handleExport} variant="light">
                  <FontAwesomeIcon icon={ faShare } />
                </Button>  */}

                <DropdownButton id="dropdown-basic-button" title={<FontAwesomeIcon icon={ faShare } />} variant="light">
                <Dropdown.Item onClick={()=>{handleExport('text')}}>Text</Dropdown.Item>
                <Dropdown.Item onClick={()=>{handleExport('text-no-speakers')}}>Text (No Speakers)</Dropdown.Item>
                <Dropdown.Item onClick={()=>{handleExport('word')}} disabled>Word</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={()=>{handleExport('json-slate')}}>Json (slate)</Dropdown.Item>
                <Dropdown.Item onClick={()=>{handleExport('json-dpe')}} disabled>Json(dpe)</Dropdown.Item>
              </DropdownButton>


                </Col>
            </Row>

        </Container>
    );
}
