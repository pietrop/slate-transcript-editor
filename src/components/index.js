import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes, { string } from 'prop-types';
import path from 'path';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Slider from '@material-ui/core/Slider';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import KeyboardReturnOutlinedIcon from '@material-ui/icons/KeyboardReturnOutlined';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import MusicNoteOutlinedIcon from '@material-ui/icons/MusicNoteOutlined';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
// import MusicNoteOutlinedIcon from '@material-ui/icons/MusicNoteOutlined';

import CachedOutlinedIcon from '@material-ui/icons/CachedOutlined';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import PauseOutlinedIcon from '@material-ui/icons/PauseOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Replay10Icon from '@material-ui/icons/Replay10';
import { withStyles } from '@material-ui/core/styles';
import { createEditor, Editor, Transforms } from 'slate';
// https://docs.slatejs.org/walkthroughs/01-installing-slate
// Import the Slate components and React plugin.
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';

import { shortTimecode } from '../util/timecode-converter';
import download from '../util/downlaod/index.js';
import convertDpeToSlate from '../util/dpe-to-slate';
// TODO: This should be moved in export utils
import insertTimecodesInline from '../util/inline-interval-timecodes';
import pluck from '../util/pluk';
import subtitlesExportOptionsList from '../util/export-adapters/subtitles-generator/list.js';
import updateTimestamps from '../util/export-adapters/slate-to-dpe/update-timestamps';
import exportAdapter from '../util/export-adapters';
import generatePreviousTimingsUpToCurrent from '../util/dpe-to-slate/generate-previous-timings-up-to-current';
import getSelectionNodes from '../util/get-selection-nodes';

import 'fontsource-roboto';
import './index.css';

const PLAYBACK_RATE_VALUES = [0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.5];
const PLAYBACK_RATE_VALUES_O = PLAYBACK_RATE_VALUES.map((o) => {
  return {
    value: o,
    // label: o,
  };
});
const SEEK_BACK_SEC = 10;
const PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS = 1500;
const MAX_DURATION_FOR_PERFORMANCE_OPTIMIZATION_IN_SECONDS = 3600;

const mediaRef = React.createRef();

// const styles = {
//   root: {
//     backgroundColor: '', //#f5f5f5
//   },
// };

const preventDefault = (event) => event.preventDefault();

function SlateTranscriptEditor(props) {
  const [anchorMenuEl, setAnchorMenuEl] = React.useState(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);
  const [value, setValue] = useState([]);
  const defaultShowSpeakersPreference = typeof props.showSpeakers === 'boolean' ? props.showSpeakers : true;
  const defaultShowTimecodesPreference = typeof props.showTimecodes === 'boolean' ? props.showTimecodes : true;
  const [showSpeakers, setShowSpeakers] = useState(defaultShowSpeakersPreference);
  const [showTimecodes, setShowTimecodes] = useState(defaultShowTimecodesPreference);
  const [speakerOptions, setSpeakerOptions] = useState([]);
  const [showSpeakersCheatShet, setShowSpeakersCheatShet] = useState(false);
  const [saveTimer, setSaveTimer] = useState(null);
  const [isPauseWhiletyping, setIsPauseWhiletyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // used isContentModified to avoid unecessarily run alignment if the slate value contnet has not been modified by the user since
  // last save or alignment
  const [isContentModified, setIsContentIsModified] = useState(false);

  useEffect(() => {
    if (isProcessing) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [isProcessing]);

  useEffect(() => {
    if (props.transcriptData) {
      const res = convertDpeToSlate(props.transcriptData);
      setValue(res);
    }
  }, []);

  // handles interim results for worrking with a Live STT
  useEffect(() => {
    if (props.transcriptDataLive) {
      const nodes = convertDpeToSlate(props.transcriptDataLive);
      // if the user is selecting the / typing the text
      // Transforms.insertNodes would insert the node at seleciton point
      // instead we check if they are in the editor
      if (editor.selection) {
        // get the position of the last node
        const positionLastNode = [editor.children.length];
        // insert the new nodes at the end of the document
        Transforms.insertNodes(editor, nodes, {
          at: positionLastNode,
        });
      }
      // use not having selection in the editor allows us to also handle the initial use case
      // where the might be no initial results
      else {
        // if there is no selection the default for insertNodes is to add the nodes at the end
        Transforms.insertNodes(editor, nodes);
      }
    }
  }, [props.transcriptDataLive]);

  useEffect(() => {
    const getUniqueSpeakers = pluck('speaker');
    const uniqueSpeakers = getUniqueSpeakers(value);
    setSpeakerOptions(uniqueSpeakers);
  }, [value]);

  //  useEffect(() => {
  //    const getUniqueSpeakers = pluck('speaker');
  //    const uniqueSpeakers = getUniqueSpeakers(value);
  //    setSpeakerOptions(uniqueSpeakers);
  //  }, [showSpeakersCheatShet]);

  useEffect(() => {
    // Update the document title using the browser API
    if (mediaRef && mediaRef.current) {
      // setDuration(mediaRef.current.duration);
      mediaRef.current.addEventListener('timeupdate', handleTimeUpdated);
    }
    return function cleanup() {
      // removeEventListener
      mediaRef.current.removeEventListener('timeupdate', handleTimeUpdated);
    };
  }, []);

  useEffect(() => {
    // Update the document title using the browser API
    if (mediaRef && mediaRef.current) {
      // Not working
      setDuration(mediaRef.current.duration);
      if (mediaRef.current.duration >= MAX_DURATION_FOR_PERFORMANCE_OPTIMIZATION_IN_SECONDS) {
        setShowSpeakers(false);
        showTimecodes(false);
      }
    }
  }, [mediaRef]);

  // used by MUI export menu
  const handleMenuClick = (event) => {
    setAnchorMenuEl(event.currentTarget);
  };

  // used by MUI export menu
  const handleMenuClose = () => {
    setAnchorMenuEl(null);
  };

  const breakParagraph = () => {
    Editor.insertBreak(editor);
  };
  const insertTextInaudible = () => {
    Transforms.insertText(editor, '[INAUDIBLE]');
  };

  const handleInsertMusicNote = () => {
    Transforms.insertText(editor, '♫'); // or ♪
  };

  const getSlateContent = () => {
    return value;
  };

  const getFileName = () => {
    return path.basename(props.mediaUrl).trim();
  };
  const getFileTitle = () => {
    if (props.title) {
      return props.title;
    }
    return getFileName();
  };

  const getMediaType = () => {
    const clipExt = path.extname(props.mediaUrl);
    let tmpMediaType = props.mediaType ? props.mediaType : 'video';
    if (clipExt === '.wav' || clipExt === '.mp3' || clipExt === '.m4a' || clipExt === '.flac' || clipExt === '.aiff') {
      tmpMediaType = 'audio';
    }
    return tmpMediaType;
  };

  const handleSetShowSpeakersCheatShet = () => {
    setShowSpeakersCheatShet(!showSpeakersCheatShet);
  };

  const handleTimeUpdated = (e) => {
    setCurrentTime(e.target.currentTime);
    // TODO: setting duration here as a workaround
    setDuration(mediaRef.current.duration);
  };

  const handleSetPlaybackRate = (n) => {
    //e.target.value
    const tmpNewPlaybackRateValue = parseFloat(n);
    if (mediaRef && mediaRef.current) {
      mediaRef.current.playbackRate = tmpNewPlaybackRateValue;
      setPlaybackRate(tmpNewPlaybackRateValue);
    }
  };

  const handleSeekBack = () => {
    if (mediaRef && mediaRef.current) {
      mediaRef.current.currentTime = mediaRef.current.currentTime - SEEK_BACK_SEC;
    }
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
        // title={'double click on a word to jump to the corresponding point in the media'}
        {...attributes}
      >
        {children}
      </span>
    );
  }, []);

  //

  /**
   * `handleSetSpeakerName` is outside of TimedTextElement
   * to improve the overall performance of the editor,
   * especially on long transcripts
   * @param {*} element - props.element, from `renderElement` function
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
      <Grid container direction="row" justify="flex-start" alignItems="flex-start" {...props.attributes}>
        {showTimecodes && (
          <Grid item contentEditable={false} xs={4} sm={2} md={4} lg={2} xl={2} className={'p-t-2 text-truncate'}>
            <code
              contentEditable={false}
              style={{ cursor: 'pointer' }}
              className={'timecode text-muted unselectable'}
              onClick={handleTimedTextClick}
              // onClick={(e) => {
              //   e.preventDefault();
              // }}
              onDoubleClick={handleTimedTextClick}
              title={props.element.startTimecode}
              data-start={props.element.start}
            >
              {props.element.startTimecode}
            </code>
          </Grid>
        )}
        {showSpeakers && (
          <Grid item contentEditable={false} xs={8} sm={10} md={8} lg={3} xl={3} className={'p-t-2 text-truncate'}>
            <Typography
              noWrap
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
              {props.element.speaker}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12} sm={12} md={12} lg={textLg} xl={textXl} className={'p-b-1 mx-auto'}>
          {props.children}
        </Grid>
      </Grid>
    );
  };

  const DefaultElement = (props) => {
    return <p {...props.attributes}>{props.children}</p>;
  };

  const handleTimedTextClick = (e) => {
    if (e.target.classList.contains('timecode')) {
      const start = e.target.dataset.start;
      if (mediaRef && mediaRef.current) {
        mediaRef.current.currentTime = parseFloat(start);
        mediaRef.current.play();
      }
    } else if (e.target.dataset.slateString) {
      if (e.target.parentNode.dataset.start) {
        const { startSec } = getSelectionNodes(editor, editor.selection);
        if (mediaRef && mediaRef.current && startSec) {
          mediaRef.current.currentTime = parseFloat(startSec);
          mediaRef.current.play();
        } else {
          // const start = e.target.parentNode.dataset.start;
          // if (mediaRef && mediaRef.current && start) {
          //   mediaRef.current.currentTime = parseFloat(start);
          //   mediaRef.current.play();
          // }
        }
      }
    }
  };

  // TODO: refacto this function, to be cleaner and easier to follow.
  const handleRestoreTimecodes = async (inlineTimecodes = false) => {
    console.info('handleRestoreTimecodes');
    if (!isContentModified && !inlineTimecodes) {
      return value;
    }
    if (inlineTimecodes) {
      const transcriptData = insertTimecodesInline({ transcriptData: JSON.parse(JSON.stringify(props.transcriptData)) });
      const alignedSlateData = await updateTimestamps(convertDpeToSlate(transcriptData), transcriptData);
      setValue(alignedSlateData);
      setIsContentIsModified(false);
      return alignedSlateData;
    } else {
      const alignedSlateData = await updateTimestamps(value, JSON.parse(JSON.stringify(props.transcriptData)));
      setValue(alignedSlateData);
      setIsContentIsModified(false);
      return alignedSlateData;
    }
  };

  const handleExport = async ({ type, ext, speakers, timecodes, inlineTimecodes, hideTitle, atlasFormat, isDownload }) => {
    try {
      setIsProcessing(true);
      let tmpValue = getSlateContent();
      if (timecodes) {
        tmpValue = await handleRestoreTimecodes();
      }

      if (inlineTimecodes) {
        tmpValue = await handleRestoreTimecodes(inlineTimecodes);
      }

      if (isContentModified && type === 'json-slate') {
        tmpValue = await handleRestoreTimecodes();
      }

      let editorContnet = exportAdapter({
        slateValue: tmpValue,
        type,
        transcriptTitle: getFileTitle(),
        speakers,
        timecodes,
        inlineTimecodes,
        hideTitle,
        atlasFormat,
        dpeTranscriptData: props.transcriptData,
      });

      if (ext === 'json') {
        editorContnet = JSON.stringify(editorContnet, null, 2);
      }
      if (ext !== 'docx' && isDownload) {
        download(editorContnet, `${getFileTitle()}.${ext}`);
      }
      return editorContnet;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const format = props.autoSaveContentType ? props.autoSaveContentType : 'digitalpaperedit';
      const editorContnet = await handleExport({ type: `json-${format}`, isDownload: false });
      if (props.handleSaveEditor) {
        props.handleSaveEditor(editorContnet);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * See explanation in `src/utils/dpe-to-slate/index.js` for how this function works with css injection
   * to provide current paragaph's highlight.
   * @param {Number} currentTime - float in seconds
   */

  const handleSetPauseWhileTyping = () => {
    setIsPauseWhiletyping(!isPauseWhiletyping);
  };

  // TODO: revisit logic for
  // - splitting paragraph via enter key
  // - merging paragraph via delete
  // - merging paragraphs via deleting across paragraphs
  const handleOnKeyDown = (event) => {
    if (event.key === 'Enter') {
      // intercept Enter, and
      event.preventDefault();
      console.info('For now disabling enter key to split a paragraph, while figuring out the aligment issue');
      return;
      const selection = editor.selection;
      const orderedSelection = [selection.anchor, selection.focus].sort((a, b) => {
        return a.path[0] - b.path[0];
      });

      const selectionStart = orderedSelection[0];
      const selectionEnd = orderedSelection[1];
      const currentParagraph = editor.children[selectionStart.path[0]];
      // Editor.insertBreak(editor);
      // Transforms.splitNodes(editor);
      // const element = { type: 'image', url, children: [{ text: '' }] };
      Editor.deleteFragment(editor, selectionStart.path[0]);
      const { startSec, endSec } = getSelectionNodes(editor, editor.selection);
    }
    if (event.key === 'Backspace') {
      const selection = editor.selection;
      // across paragraph
      if (selection.anchor.path[0] !== selection.focus.path[0]) {
        console.info('For now cannot merge paragraph via delete across paragraphs, while figuring out the aligment issue');
        event.preventDefault();
        return;
      }
      // beginning of a paragrraph
      if (selection.anchor.offset === 0 && selection.focus.offset === 0) {
        console.info('For now cannot merge paragraph via delete, while figuring out the aligment issue');
        event.preventDefault();
        return;
      }
    }
    setIsContentIsModified(true);
    if (isPauseWhiletyping) {
      // logic for pause while typing
      // https://schier.co/blog/wait-for-user-to-stop-typing-using-javascript
      // TODO: currently eve the video was paused, and pause while typing is on,
      // it will play it when stopped typing. so added btn to turn feature on off.
      // and disabled as default.
      // also pause while typing might introduce performance issues on longer transcripts
      // if on every keystroke it's creating and destroing a timer.
      // should find a more efficient way to "debounce" or "throttle" this functionality
      if (mediaRef && mediaRef.current) {
        mediaRef.current.pause();
      }

      if (saveTimer !== null) {
        clearTimeout(saveTimer);
      }

      const tmpSaveTimer = setTimeout(() => {
        if (mediaRef && mediaRef.current) {
          mediaRef.current.play();
        }
      }, PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS);
      setSaveTimer(tmpSaveTimer);
    }
  };
  return (
    <div style={{ paddingTop: '1em' }}>
      <CssBaseline />
      <Container>
        <Paper elevation={3} />
        <style scoped>
          {`
              /* Next words */
             .timecode[data-previous-timings*="${generatePreviousTimingsUpToCurrent(parseInt(currentTime), value)}"]{
                  color:  #9E9E9E;
              }
          `}
        </style>
        <style scoped>
          {`.editor-wrapper-container{
                padding: 8px 16px;
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
        {props.showTitle && (
          <Tooltip title={props.title}>
            <Typography variant="h5" noWrap>
              {props.title}
            </Typography>
          </Tooltip>
        )}

        <Grid container direction="row" justify="space-around" alignItems="flex-start" spacing={2}>
          <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
            <Grid container direction="column" justify="space-between" alignItems="flex-start">
              <Grid item style={{ backgroundColor: 'black' }}>
                <video ref={mediaRef} src={props.mediaUrl} width={'100%'} height="auto" controls playsInline></video>
              </Grid>
              <Grid item>
                <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={0}>
                  <Grid item>
                    <Button disabled>{shortTimecode(currentTime)}</Button>
                    <Button disabled>{duration ? ` | ${shortTimecode(duration)}` : '00:00:00'}</Button>
                  </Grid>
                  <Grid item>
                    <FormControl>
                      {/* <InputLabel id="demo-simple-select-label">Speed</InputLabel> */}
                      <Select labelId="demo-simple-select-label" id="demo-simple-select" value={playbackRate} onChange={handleSetPlaybackRate}>
                        {PLAYBACK_RATE_VALUES.map((playbackRateValue, index) => {
                          return (
                            <MenuItem key={index + playbackRateValue} value={playbackRateValue}>
                              {' '}
                              x {playbackRateValue}
                            </MenuItem>
                          );
                        })}
                      </Select>
                      {/* <FormHelperText>Speed</FormHelperText> */}
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <Tooltip title={`Seek back by ${SEEK_BACK_SEC} seconds`}>
                      <Button color="primary" onClick={handleSeekBack} block="true">
                        <Replay10Icon color="primary" />
                      </Button>
                    </Tooltip>
                    {/* </OverlayTrigger> */}
                  </Grid>
                </Grid>
              </Grid>
              {/* <Grid item>
                <Grid container direction="row" justify="flex-start" alignItems="flex-start">
                  <div style={{ width: 120 }}>
                    <FormHelperText>Speed</FormHelperText>
                    <Slider
                      defaultValue={playbackRate}
                      value={playbackRate}
                      // getAriaValueText={'test'}
                      aria-labelledby="discrete-slider"
                      valueLabelDisplay="auto"
                      step={0.2}
                      marks={PLAYBACK_RATE_VALUES_O}
                      min={0.2}
                      max={3.5}
                      track
                      onChange={(e, n) => {
                        handleSetPlaybackRate(n);
                      }}
                    />
                  </div>

                  <Tooltip title="reset speed">
                    <Button
                      onClick={() => {
                        handleSetPlaybackRate(1);
                      }}
                    >
                      <ClearOutlinedIcon color="primary" />
                    </Button>
                  </Tooltip>
                </Grid> 
              </Grid>*/}
              <Grid item>
                {/* <br />
                <Typography variant="subtitle2" gutterBottom>
                  File
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {getFileName()}
                </Typography>
                <br />
                <Typography variant="subtitle2" gutterBottom>
                  Speakers
                </Typography>
                {speakerOptions.map((speakerName, index) => {
                  return (
                    <Typography variant="body2" gutterBottom key={index + speakerName} className={'text-truncate'} title={speakerName.toUpperCase()}>
                      {speakerName}
                    </Typography>
                  );
                })} */}

                {/* <Accordion onClick={handleSetShowSpeakersCheatShet}>
                <Accordion.Toggle as={Button} variant="link" eventKey="0">
                  <Badge color="primary">Speakers</Badge>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                  <ListGroup>
                    {speakerOptions.map((speakerName, index) => {
                      return (
                        <ListGroup.Item key={index + speakerName} className={'text-truncate'} title={speakerName.toUpperCase()}>
                          {speakerName.toUpperCase()}
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </Accordion.Collapse>
              </Accordion> */}
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={7} md={7} lg={8} xl={7}>
            {value.length !== 0 ? (
              <>
                <Paper elevation={3}>
                  <section className="editor-wrapper-container">
                    <Slate
                      editor={editor}
                      value={value}
                      onChange={(value) => {
                        if (props.handleAutoSaveChanges) {
                          props.handleAutoSaveChanges(value);
                        }
                        return setValue(value);
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
                </Paper>
              </>
            ) : (
              <section className="text-center">
                <i className="text-center">Loading...</i>
              </section>
            )}
          </Grid>

          <Grid item xs={12} sm={1} md={1} lg={1} xl={2}>
            <Grid container direction="row" justify="flex-start" alignItems="flex-start">
              <div>
                <Tooltip title={'Export options'}>
                  <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleMenuClick}>
                    <SaveAltIcon color="primary" /> <KeyboardArrowDownIcon color="primary" />
                  </Button>
                </Tooltip>
                <Menu id="simple-menu" anchorEl={anchorMenuEl} keepMounted open={Boolean(anchorMenuEl)} onClose={handleMenuClose}>
                  <MenuItem onClick={handleMenuClose} disabled>
                    <Link style={{ color: 'black' }}>Text Export</Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'text',
                        ext: 'txt',
                        speakers: false,
                        timecodes: false,
                        isDownload: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary">
                      Text (<code>.txt</code>)
                    </Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'text',
                        ext: 'txt',
                        speakers: true,
                        timecodes: false,
                        isDownload: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary">Text (Speakers)</Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'text',
                        ext: 'txt',
                        speakers: false,
                        timecodes: true,
                        isDownload: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary">Text (Timecodes)</Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'text',
                        ext: 'txt',
                        speakers: true,
                        timecodes: true,
                        isDownload: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary"> Text (Speakers & Timecodes)</Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'text',
                        ext: 'txt',
                        speakers: true,
                        timecodes: true,
                        atlasFormat: true,
                        isDownload: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary"> Text (Atlas format)</Link>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'word',
                        ext: 'docx',
                        speakers: false,
                        timecodes: false,
                        isDownload: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary">
                      {' '}
                      Word (<code>.docx</code>)
                    </Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'word',
                        ext: 'docx',
                        speakers: true,
                        timecodes: false,
                        isDownload: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary"> Word (Speakers)</Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'word',
                        ext: 'docx',
                        speakers: false,
                        timecodes: true,
                        isDownload: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary"> Word (Timecodes)</Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'word',
                        ext: 'docx',
                        speakers: true,
                        timecodes: true,
                        isDownload: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary"> Word (Speakers & Timecodes)</Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'word',
                        ext: 'docx',
                        speakers: false,
                        timecodes: false,
                        inlineTimecodes: true,
                        hideTitle: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary"> Word (OHMS)</Link>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleMenuClose} disabled>
                    <Link style={{ color: 'black' }}>Closed Captions Export</Link>
                  </MenuItem>
                  {subtitlesExportOptionsList.map(({ type, label, ext }, index) => {
                    return (
                      <MenuItem
                        key={index + label}
                        onClick={() => {
                          handleExport({ type, ext, isDownload: true });
                          handleMenuClose();
                        }}
                      >
                        <Link color="primary">
                          {label} (<code>.{ext}</code>)
                        </Link>
                      </MenuItem>
                    );
                  })}
                  <Divider />
                  <MenuItem onClick={handleMenuClose} disabled>
                    <Link style={{ color: 'black' }}>Developer options</Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'json-slate',
                        ext: 'json',
                        speakers: true,
                        timecodes: true,
                        isDownload: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary">
                      SlateJs (<code>.json</code>)
                    </Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleExport({
                        type: 'json-digitalpaperedit',
                        ext: 'json',
                        speakers: true,
                        timecodes: true,
                        isDownload: true,
                      });
                      handleMenuClose();
                    }}
                  >
                    <Link color="primary">
                      DPE (<code>.json</code>)
                    </Link>
                  </MenuItem>
                </Menu>
              </div>

              <Tooltip title={'save'}>
                <Button disabled={isProcessing} onClick={handleSave} color="primary">
                  <SaveOutlinedIcon color="primary" />
                </Button>
              </Tooltip>

              {/* TODO: Disabiling until find a way to handle timecodes and alignment on paragraph break */}
              {/*   <Tooltip
                title={`To insert a paragraph break, and split a pargraph in two, put the cursor at a point where you'd want to add a paragraph break in the text and either click this button or hit enter key`}
              >
                <Button disabled={isProcessing} onClick={breakParagraph} color="primary" disabled>
                  <KeyboardReturnOutlinedIcon color="primary" />
                </Button>
              </Tooltip>

              <Tooltip title={`Put the cursor at a point where you'd want to add [INAUDIBLE] text, and click this button`}>
                <Button disabled={isProcessing} onClick={insertTextInaudible} color="primary">
                  <HelpOutlineOutlinedIcon color="primary" />
                </Button>
              </Tooltip>

              <Tooltip title={'Insert a ♫ in the text'}>
                <Button disabled={isProcessing} onClick={handleInsertMusicNote} color="primary">
                  <MusicNoteOutlinedIcon color="primary" />
                </Button>
              </Tooltip> */}

              <Tooltip
                title={` Turn ${
                  isPauseWhiletyping ? 'off' : 'on'
                } pause while typing functionality. As you start typing the media while pause playback
                      until you stop. Not reccomended on longer transcript as it might present performance issues.`}
              >
                <Button disabled={isProcessing} onClick={handleSetPauseWhileTyping} color={isPauseWhiletyping ? 'secondary' : 'primary'}>
                  <PauseOutlinedIcon color="primary" />
                </Button>
              </Tooltip>

              <Tooltip title={' Restore timecodes. At the moment for transcript over 1hour it could temporarily freeze the UI for a few seconds'}>
                <Button
                  disabled={isProcessing}
                  onClick={async () => {
                    try {
                      setIsProcessing(true);
                      await handleRestoreTimecodes();
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  color="primary"
                >
                  <CachedOutlinedIcon color="primary" />
                </Button>
              </Tooltip>

              <Tooltip title={' Double click on a word to jump to the corresponding point in the media'}>
                <Button disabled={isProcessing} color="primary">
                  <InfoOutlined color="primary" />
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

// export default withStyles(styles)(SlateTranscriptEditor);
export default SlateTranscriptEditor;

// SlateTranscriptEditor.propTypes = {
//   transcriptData: PropTypes.object.isRequired,
//   mediaUrl: PropTypes.string.isRequired,
//   handleSaveEditor: PropTypes.func,
//   handleAutoSaveChanges: PropTypes.func,
//   autoSaveContentType: PropTypes.string,
//   isEditable: PropTypes.boolean,
//   showTimecodes: PropTypes.boolean,
//   showSpeakers: PropTypes.boolean,
//   title: PropTypes.string,
//   showTitle: PropTypes.boolean,
//   mediaType: PropTypes.string,
//   transcriptDataLive: PropTypes.object,
// };

// SlateTranscriptEditor.defaultProps = {
//   showTitle: false,
//   showTimecodes: true,
//   showSpeakers: true,
//   mediaType: 'digitalpaperedit',
//   isEditable: true,
// };
