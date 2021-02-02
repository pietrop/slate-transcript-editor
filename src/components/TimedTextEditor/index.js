import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import path from 'path';
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
import { createEditor, Editor, Transforms } from 'slate';
// https://docs.slatejs.org/walkthroughs/01-installing-slate
// Import the Slate components and React plugin.
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { faSave, faShare, faUndo, faSync, faInfoCircle, faMehBlank, faPause, faMusic, faClosedCaptioning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { shortTimecode } from '../../util/timecode-converter';
import download from '../../util/downlaod/index.js';
import convertDpeToSlate from '../../util/dpe-to-slate';
// TODO: This should be moved in export utils
import insertTimecodesInline from '../../util/inline-interval-timecodes';
import pluck from '../../util/pluk';
import subtitlesExportOptionsList from '../../util/export-adapters/subtitles-generator/list.js';
import updateTimestamps from '../../util/export-adapters/slate-to-dpe/update-timestamps';
import exportAdapter from '../../util/export-adapters';
import generatePreviousTimingsUpToCurrent from './generate-previous-timings-up-to-current';

const PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS = 1500;
//  <SlateTranscriptEditor mediaUrl={props.mediaUrl} transcriptData={chunk} title={props.title} showTitle={props.showTitle} mediaUrl={props.mediaUrl} />;

const TimedTextEditor = (props) => {
  //   const [currentTime, setCurrentTime] = useState(0);
  //   const [duration, setDuration] = useState(0);
  //   const [playbackRate, setPlaybackRate] = useState(1);
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);
  const [value, setValue] = useState([]);
  const defaultShowSpeakersPreference = typeof props.showSpeakers === 'boolean' ? props.showSpeakers : true;
  const defaultShowTimecodesPreference = typeof props.showTimecodes === 'boolean' ? props.showTimecodes : true;
  const [showSpeakers, setShowSpeakers] = useState(defaultShowSpeakersPreference);
  // const showSpeakers = props.showSpeakers;
  const [showTimecodes, setShowTimecodes] = useState(defaultShowTimecodesPreference);
  // const showTimecodes = props.showTimecodes;
  // const [speakerOptions, setSpeakerOptions] = useState([]);
  // const [showSpeakersCheatShet, setShowSpeakersCheatShet] = useState(false);
  const [saveTimer, setSaveTimer] = useState(null);
  //   const [isPauseWhiletyping, setIsPauseWhiletyping] = useState(false);
  //   const [isProcessing, setIsProcessing] = useState(false);
  // used isContentModified to avoid unecessarily run alignment if the slate value contnet has not been modified by the user since
  // last save or alignment
  // const [isContentModified, setIsContentIsModified] = useState(false);

  // const getSlateContent = () => {
  //   // props.getSlateContent(value);
  //   return value;
  // };
  // useEffect(() => {
  //   if (props.transcriptData) {
  //     // const res = convertDpeToSlate(props.transcriptData);
  //     // setValue(res);
  //     setValue(value)
  //   }
  // }, []);

  useEffect(() => {
    if (props.value) {
      // const res = convertDpeToSlate(props.transcriptData);
      // setValue(res);
      setValue(props.value);
    }
  }, [props.value]);

  // useEffect(() => {
  //   return getSlateContent(value);
  // }, [getSlateContent]);

  // useEffect(() => {
  //   return; //setValue(props.value);
  // }, [props.value]);

  const TimedTextElement = (props) => {
    let textLg = 12;
    let textXl = 12;
    if (!showSpeakers && !showTimecodes) {
      textLg = 12;
      textXl = 12;
    } else if (showSpeakers && !showTimecodes) {
      textLg = 9;
      textXl = 9;
    } else if (!showSpeakers && showTimecodes) {
      textLg = 9;
      textXl = 10;
    } else if (showSpeakers && showTimecodes) {
      textLg = 6;
      textXl = 7;
    }

    return (
      <Row {...props.attributes}>
        {showTimecodes && (
          <Col contentEditable={false} xs={4} sm={2} md={4} lg={3} xl={2} className={'p-t-2 text-truncate'}>
            <code
              contentEditable={false}
              style={{ cursor: 'pointer' }}
              className={'timecode text-muted unselectable'}
              onClick={handleTimedTextClick}
              title={props.element.startTimecode}
              data-start={props.element.start}
            >
              {props.element.startTimecode}
            </code>
          </Col>
        )}
        {showSpeakers && (
          <Col contentEditable={false} xs={8} sm={10} md={8} lg={3} xl={3} className={'p-t-2 text-truncate'}>
            <span
              contentEditable={false}
              className={'text-truncate text-muted unselectable'}
              style={{
                cursor: 'pointer',
                width: '100%',
                textTransform: 'uppercase',
              }}
              // title={props.element.speaker.toUpperCase()}
              title={props.element.speaker}
              onClick={handleSetSpeakerName.bind(this, props.element)}
            >
              {' '}
              {props.element.speaker}
            </span>
          </Col>
        )}
        <Col xs={12} sm={12} md={12} lg={textLg} xl={textXl} className={'p-b-1 mx-auto'}>
          {props.children}
        </Col>
      </Row>
    );
  };

  const DefaultElement = (props) => {
    return (
      <p contentEditable={false} {...props.attributes}>
        {props.children}
      </p>
    );
  };

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'timedText':
        return <TimedTextElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback(({ attributes, children, leaf }) => {
    return (
      <span
        onDoubleClick={handleTimedTextClick}
        className={'timecode text'}
        data-start={children.props.parent.start}
        data-previous-timings={children.props.parent.previousTimings}
        title={children.props.parent.startTimecode}
        {...attributes}
      >
        {children}
      </span>
    );
  }, []);

  /**
   * `handleSetSpeakerName` is outside of TimedTextElement
   * to improve the overall performance of the editor,
   * especially on long transcripts
   * @param {*} element - props.element, from `renderElement` function
   * TODO: handleSetSpeakerName should trigger a prop on auto save
   */
  const handleSetSpeakerName = (element) => {
    const pathToCurrentNode = ReactEditor.findPath(editor, element);
    const oldSpeakerName = element.speaker;
    const newSpeakerName = prompt('Change speaker name', oldSpeakerName);
    if (newSpeakerName) {
      const isUpdateAllSpeakerInstances = confirm(`Would you like to replace all occurrences of ${oldSpeakerName} with ${newSpeakerName}?`);
      if (isUpdateAllSpeakerInstances) {
        const rangeForTheWholeEditor = Editor.range(editor, []);
        // Apply transformation to the whole doc, where speaker matches old spekaer name, and set it to new one
        Transforms.setNodes(
          editor,
          { type: 'timedText', speaker: newSpeakerName },
          {
            at: rangeForTheWholeEditor,
            match: (node) => node.type === 'timedText' && node.speaker.toLowerCase() === oldSpeakerName.toLowerCase(),
          }
        );
      } else {
        // only apply speaker name transformation to current element
        Transforms.setNodes(editor, { type: 'timedText', speaker: newSpeakerName }, { at: pathToCurrentNode });
      }
    }
  };

  const handleTimedTextClick = (e) => {
    if (e.target.classList.contains('timecode')) {
      const start = e.target.dataset.start;
      props.onWordClick(start);
      //   if (mediaRef && mediaRef.current) {
      //     mediaRef.current.currentTime = parseInt(start);
      //     mediaRef.current.play();
      //   }
    } else if (e.target.dataset.slateString) {
      if (e.target.parentNode.dataset.start) {
        const start = e.target.parentNode.dataset.start;
        props.onWordClick(start);
        // if (mediaRef && mediaRef.current && start) {
        //   mediaRef.current.currentTime = parseInt(start);
        //   mediaRef.current.play();
        // }
      }
    }
  };

  const handleOnKeyDown = (event) => {
    if (props.isPauseWhiletyping) {
      // logic for pause while typing
      // https://schier.co/blog/wait-for-user-to-stop-typing-using-javascript
      // TODO: currently eve the video was paused, and pause while typing is on,
      // it will play it when stopped typing. so added btn to turn feature on off.
      // and disabled as default.
      // also pause while typing might introduce performance issues on longer transcripts
      // if on every keystroke it's creating and destroing a timer.
      // should find a more efficient way to "debounce" or "throttle" this functionality
      if (props.mediaRef && props.mediaRef.current) {
        props.mediaRef.current.pause();
      }

      if (saveTimer !== null) {
        clearTimeout(saveTimer);
      }

      const tmpSaveTimer = setTimeout(() => {
        if (props.mediaRef && props.mediaRef.current) {
          props.mediaRef.current.play();
        }
      }, PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS);
      setSaveTimer(tmpSaveTimer);
    }
  };

  return (
    <>
      <style scoped>
        {`/* Next words */
               .timecode[data-previous-timings*="${generatePreviousTimingsUpToCurrent(parseInt(props.currentTime), props.value)}"]{
                  color:  #9E9E9E;
              }`}
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
      {props.value ? (
        <>
          <section className="editor-wrapper-container">
            <Slate
              editor={editor}
              value={props.value}
              onChange={(value) => {
                if (props.handleAutoSaveChanges) {
                  props.handleAutoSaveChanges(value);
                  // setIsContentIsModified(false);
                }
                // return setValue(value);
                // return value;
              }}
            >
              <Editable
                readOnly={typeof props.isEditable === 'boolean' ? !props.isEditable : false}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onKeyDown={handleOnKeyDown}
              />
            </Slate>
          </section>
        </>
      ) : (
        <section className="text-center">
          <i className="text-center">Loading...</i>
        </section>
      )}
    </>
  );
};

export default TimedTextEditor;
