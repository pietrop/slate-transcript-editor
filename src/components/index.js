import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes, { string } from 'prop-types';
import path from 'path';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Link from '@material-ui/core/Link';
import Replay10Icon from '@material-ui/icons/Replay10';
import Forward10Icon from '@material-ui/icons/Forward10';
import Collapse from '@material-ui/core/Collapse';
import Tooltip from '@material-ui/core/Tooltip';
import KeyboardReturnOutlinedIcon from '@material-ui/icons/KeyboardReturnOutlined';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import PeopleIcon from '@material-ui/icons/People';
import FormLabel from '@material-ui/core/FormLabel';
import Switch from '@material-ui/core/Switch';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import FormHelperText from '@material-ui/core/FormHelperText';
import EditIcon from '@material-ui/icons/Edit';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import SaveIcon from '@material-ui/icons/Save';
import debounce from 'lodash/debounce';
import { createEditor, Editor, Transforms } from 'slate';
// https://docs.slatejs.org/walkthroughs/01-installing-slate
// Import the Slate components and React plugin.
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';

import SideBtns from './SideBtns';
import { shortTimecode } from '../util/timecode-converter';
import download from '../util/downlaod/index.js';
import convertDpeToSlate from '../util/dpe-to-slate';
// TODO: This should be moved in export utils
import insertTimecodesInLineInSlateJs from '../util/insert-timecodes-in-line-in-words-list';
import pluck from '../util/pluk';
import plainTextalignToSlateJs from '../util/export-adapters/slate-to-dpe/update-timestamps/plain-text-align-to-slate';
import updateBloocksTimestamps from '../util/export-adapters/slate-to-dpe/update-timestamps/update-bloocks-timestamps';
import exportAdapter, { isCaptionType } from '../util/export-adapters';
import generatePreviousTimingsUpToCurrent from '../util/dpe-to-slate/generate-previous-timings-up-to-current';
import SlateHelpers from './slate-helpers';

const PLAYBACK_RATE_VALUES = [0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.5];
const SEEK_BACK_SEC = 10;
const PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS = 1500;
// const MAX_DURATION_FOR_PERFORMANCE_OPTIMIZATION_IN_SECONDS = 3600;
const REPLACE_WHOLE_TEXT_INSTRUCTION =
  'Replace whole text. \n\nAdvanced feature, if you already have an accurate transcription for the whole text, and you want to restore timecodes for it, you can use this to replace the text in this transcript. \n\nFor now this is an experimental feature. \n\nIt expects plain text, with paragraph breaks as new line breaks but no speakers.';

const mediaRef = React.createRef();

const pauseWhileTypeing = (current) => {
  current.play();
};
const debouncePauseWhileTyping = debounce(pauseWhileTypeing, PAUSE_WHILTE_TYPING_TIMEOUT_MILLISECONDS);

function SlateTranscriptEditor(props) {
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
  const [showSpeakersCheatShet, setShowSpeakersCheatShet] = useState(true);
  const [saveTimer, setSaveTimer] = useState(null);
  const [isPauseWhiletyping, setIsPauseWhiletyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // used isContentModified to avoid unecessarily run alignment if the slate value contnet has not been modified by the user since
  // last save or alignment
  const [isContentModified, setIsContentIsModified] = useState(false);
  const [isContentSaved, setIsContentSaved] = useState(true);

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
      if (mediaRef && mediaRef.current) {
        mediaRef.current.removeEventListener('timeupdate', handleTimeUpdated);
      }
    };
  }, []);

  useEffect(() => {}, [currentTime]);

  // useEffect(() => {
  //   // Update the document title using the browser API
  //   if (mediaRef && mediaRef.current) {
  //     // Not working
  //     setDuration(mediaRef.current.duration);
  //     if (mediaRef.current.duration >= MAX_DURATION_FOR_PERFORMANCE_OPTIMIZATION_IN_SECONDS) {
  //       setShowSpeakers(false);
  //       showTimecodes(false);
  //     }
  //   }
  // }, [mediaRef]);

  const insertTextInaudible = () => {
    Transforms.insertText(editor, '[INAUDIBLE]');
    if (props.handleAnalyticsEvents) {
      props.handleAnalyticsEvents('ste_clicked_on_insert', {
        btn: '[INAUDIBLE]',
        fn: 'insertTextInaudible',
      });
    }
  };

  const handleInsertMusicNote = () => {
    Transforms.insertText(editor, '♪'); // or ♫
    if (props.handleAnalyticsEvents) {
      props.handleAnalyticsEvents('ste_clicked_on_insert', {
        btn: '♫',
        fn: 'handleInsertMusicNote',
      });
    }
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

  const handleTimeUpdated = (e) => {
    setCurrentTime(e.target.currentTime);
    // TODO: setting duration here as a workaround
    setDuration(mediaRef.current.duration);
    //  TODO: commenting this out for now, not sure if it will fire to often?
    // if (props.handleAnalyticsEvents) {
    //   // handles if click cancel and doesn't set speaker name
    //   props.handleTimeUpdated('ste_handle_time_update', {
    //     fn: 'handleTimeUpdated',
    //     duration: mediaRef.current.duration,
    //     currentTime: e.target.currentTime,
    //   });
    // }
  };

  const handleSetPlaybackRate = (e) => {
    const previousPlaybackRate = playbackRate;
    const n = e.target.value;
    const tmpNewPlaybackRateValue = parseFloat(n);
    if (mediaRef && mediaRef.current) {
      mediaRef.current.playbackRate = tmpNewPlaybackRateValue;
      setPlaybackRate(tmpNewPlaybackRateValue);

      if (props.handleAnalyticsEvents) {
        props.handleAnalyticsEvents('ste_handle_set_playback_rate', {
          fn: 'handleSetPlaybackRate',
          previousPlaybackRate,
          newPlaybackRate: tmpNewPlaybackRateValue,
        });
      }
    }
  };

  const handleSeekBack = () => {
    if (mediaRef && mediaRef.current) {
      const newCurrentTime = mediaRef.current.currentTime - SEEK_BACK_SEC;
      mediaRef.current.currentTime = newCurrentTime;

      if (props.handleAnalyticsEvents) {
        props.handleAnalyticsEvents('ste_handle_seek_back', {
          fn: 'handleSeekBack',
          newCurrentTimeInSeconds: newCurrentTime,
          seekBackValue: SEEK_BACK_SEC,
        });
      }
    }
  };

  const handleFastForward = () => {
    if (mediaRef && mediaRef.current) {
      const newCurrentTime = mediaRef.current.currentTime + SEEK_BACK_SEC;
      mediaRef.current.currentTime = newCurrentTime;

      if (props.handleAnalyticsEvents) {
        props.handleAnalyticsEvents('ste_handle_fast_forward', {
          fn: 'handleFastForward',
          newCurrentTimeInSeconds: newCurrentTime,
          seekBackValue: SEEK_BACK_SEC,
        });
      }
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
    if (props.isEditable) {
      const pathToCurrentNode = ReactEditor.findPath(editor, element);
      const oldSpeakerName = element.speaker;
      const newSpeakerName = prompt('Change speaker name', oldSpeakerName);
      if (newSpeakerName) {
        const isUpdateAllSpeakerInstances = confirm(`Would you like to replace all occurrences of ${oldSpeakerName} with ${newSpeakerName}?`);
        if (props.handleAnalyticsEvents) {
          // handles if set speaker name, and whether updates one or multiple
          props.handleAnalyticsEvents('ste_set_speaker_name', {
            fn: 'handleSetSpeakerName',
            changeSpeaker: true,
            updateMultiple: isUpdateAllSpeakerInstances,
          });
        }
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
      } else {
        if (props.handleAnalyticsEvents) {
          // handles if click cancel and doesn't set speaker name
          props.handleAnalyticsEvents('ste_set_speaker_name', {
            fn: 'handleSetSpeakerName',
            changeSpeaker: false,
            updateMultiple: false,
          });
        }
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
      <Grid container direction="row" justifycontent="flex-start" alignItems="flex-start" {...props.attributes}>
        {showTimecodes && (
          <Grid item contentEditable={false} xs={4} sm={3} md={3} lg={2} xl={2} className={'p-t-2 text-truncate'}>
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
          <Grid item contentEditable={false} xs={8} sm={9} md={9} lg={3} xl={3} className={'p-t-2 text-truncate'}>
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

        if (props.handleAnalyticsEvents) {
          // handles if click cancel and doesn't set speaker name
          props.handleAnalyticsEvents('ste_handle_timed_text_click', {
            fn: 'handleTimedTextClick',
            clickOrigin: 'timecode',
            timeInSeconds: mediaRef.current.currentTime,
          });
        }
      }
    } else if (e.target.dataset.slateString) {
      if (e.target.parentNode.dataset.start) {
        const { startWord } = SlateHelpers.getSelectionNodes(editor, editor.selection);
        if (mediaRef && mediaRef.current && startWord && startWord.start) {
          mediaRef.current.currentTime = parseFloat(startWord.start);
          mediaRef.current.play();

          if (props.handleAnalyticsEvents) {
            // handles if click cancel and doesn't set speaker name
            props.handleAnalyticsEvents('ste_handle_timed_text_click', {
              fn: 'handleTimedTextClick',
              clickOrigin: 'word',
              timeInSeconds: mediaRef.current.currentTime,
            });
          }
        } else {
          // fallback in case there's some misalignment with the words
          // use the start of paragraph instead
          const start = parseFloat(e.target.parentNode.dataset.start);
          if (mediaRef && mediaRef.current && start) {
            mediaRef.current.currentTime = parseFloat(start);
            mediaRef.current.play();

            if (props.handleAnalyticsEvents) {
              // handles if click cancel and doesn't set speaker name
              props.handleAnalyticsEvents('ste_handle_timed_text_click', {
                fn: 'handleTimedTextClick',
                origin: 'paragraph-fallback',
                timeInSeconds: mediaRef.current.currentTime,
              });
            }
          }
        }
      }
    }
  };

  const handleReplaceText = () => {
    const newText = prompt(`Paste the text to replace here.\n\n${REPLACE_WHOLE_TEXT_INSTRUCTION}`);
    if (newText) {
      const newValue = plainTextalignToSlateJs(props.transcriptData, newText, value);
      setValue(newValue);

      // TODO: consider adding some kind of word count here?
      if (props.handleAnalyticsEvents) {
        // handles if click cancel and doesn't set speaker name
        props.handleAnalyticsEvents('ste_handle_replace_text', {
          fn: 'handleReplaceText',
        });
      }
    }
  };

  // TODO: refacto this function, to be cleaner and easier to follow.
  const handleRestoreTimecodes = async (inlineTimecodes = false) => {
    // if nothing as changed and you don't need to modify the data
    // to get inline timecodes, then just return as is
    if (!isContentModified && !inlineTimecodes) {
      return value;
    }
    // only used by Word (OHMS) export
    const alignedSlateData = await updateBloocksTimestamps(value, inlineTimecodes);
    setValue(alignedSlateData);
    setIsContentIsModified(false);

    if (inlineTimecodes) {
      // we don't want to show the inline timecode in the editor, but we want to return them to export function
      const alignedSlateDataWithInlineTimecodes = insertTimecodesInLineInSlateJs(alignedSlateData);
      return alignedSlateDataWithInlineTimecodes;
    }

    return alignedSlateData;
  };

  // TODO: this could be refactore, and brought some of this logic inside the exportAdapter (?)
  // To make this a little cleaner
  const handleExport = async ({ type, ext, speakers, timecodes, inlineTimecodes, hideTitle, atlasFormat, isDownload }) => {
    if (props.handleAnalyticsEvents) {
      // handles if click cancel and doesn't set speaker name
      props.handleAnalyticsEvents('ste_handle_export', {
        fn: 'handleExport',
        type,
        ext,
        speakers,
        timecodes,
        inlineTimecodes,
        hideTitle,
        atlasFormat,
        isDownload,
      });
    }

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

      if (isContentModified && type === 'json-digitalpaperedit') {
        tmpValue = await handleRestoreTimecodes();
      }

      if (isContentModified && isCaptionType(type)) {
        tmpValue = await handleRestoreTimecodes();
      }
      // export adapter does not doo any alignment
      // just converts between formats
      let editorContnet = exportAdapter({
        slateValue: tmpValue,
        type,
        transcriptTitle: getFileTitle(),
        speakers,
        timecodes,
        inlineTimecodes,
        hideTitle,
        atlasFormat,
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
      if (props.handleAnalyticsEvents) {
        // handles if click cancel and doesn't set speaker name
        props.handleAnalyticsEvents('ste_handle_save', {
          fn: 'handleSave',
          format,
        });
      }

      if (props.handleSaveEditor && props.isEditable) {
        props.handleSaveEditor(editorContnet);
      }
      setIsContentIsModified(false);
      setIsContentSaved(true);
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
    if (props.handleAnalyticsEvents) {
      // handles if click cancel and doesn't set speaker name
      props.handleAnalyticsEvents('ste_handle_set_pause_while_typing', {
        fn: 'handleSetPauseWhileTyping',
        isPauseWhiletyping: !isPauseWhiletyping,
      });
    }
    setIsPauseWhiletyping(!isPauseWhiletyping);
  };

  const handleSplitParagraph = () => {
    SlateHelpers.handleSplitParagraph(editor);
  };

  const handleUndo = () => {
    editor.undo();
  };

  const handleRedo = () => {
    editor.redo();
  };

  // const debounced_version = throttle(handleRestoreTimecodes, 3000, { leading: false, trailing: true });
  // TODO: revisit logic for
  // - splitting paragraph via enter key
  // - merging paragraph via delete
  // - merging paragraphs via deleting across paragraphs
  const handleOnKeyDown = async (event) => {
    setIsContentIsModified(true);
    setIsContentSaved(false);
    //  ArrowRight ArrowLeft ArrowUp ArrowUp
    if (event.key === 'Enter') {
      // intercept Enter, and handle timecodes when splitting a paragraph
      event.preventDefault();
      // console.info('For now disabling enter key to split a paragraph, while figuring out the aligment issue');
      // handleSetPauseWhileTyping();
      // TODO: Edge case, hit enters after having typed some other words?
      const isSuccess = SlateHelpers.handleSplitParagraph(editor);
      if (props.handleAnalyticsEvents) {
        // handles if click cancel and doesn't set speaker name
        props.handleAnalyticsEvents('ste_handle_split_paragraph', {
          fn: 'handleSplitParagraph',
          isSuccess,
        });
      }
      if (isSuccess) {
        // as part of splitting paragraphs there's an alignement step
        // so content is not counted as modified
        setIsContentIsModified(false);
      }
    }
    if (event.key === 'Backspace') {
      const isSuccess = SlateHelpers.handleDeleteInParagraph({ editor, event });
      // Commenting that out for now, as it might get called too often
      // if (props.handleAnalyticsEvents) {
      //   // handles if click cancel and doesn't set speaker name
      //   props.handleAnalyticsEvents('ste_handle_delete_paragraph', {
      //     fn: 'handleDeleteInParagraph',
      //     isSuccess,
      //   });
      // }
      if (isSuccess) {
        // as part of splitting paragraphs there's an alignement step
        // so content is not counted as modified
        setIsContentIsModified(false);
      }
    }
    // if (event.key.length == 1 && ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 49 && event.keyCode <= 57))) {
    //   const alignedSlateData = await debouncedSave(value);
    //   setValue(alignedSlateData);
    //   setIsContentIsModified(false);
    // }

    if (isPauseWhiletyping) {
      // logic for pause while typing
      // https://schier.co/blog/wait-for-user-to-stop-typing-using-javascript
      // TODO: currently eve the video was paused, and pause while typing is on,
      // it will play it when stopped typing. so added btn to turn feature on off.
      // and disabled as default.
      // also pause while typing might introduce performance issues on longer transcripts
      // if on every keystroke it's creating and destroing a timer.
      // should find a more efficient way to "debounce" or "throttle" this functionality
      if (mediaRef && mediaRef.current && !mediaRef.current.paused) {
        mediaRef.current.pause();
        debouncePauseWhileTyping(mediaRef.current);
      }
    }
    // auto align when not typing
  };
  return (
    <div style={{ paddingTop: '1em' }}>
      <CssBaseline />
      <Container>
        <Paper elevation={3} />
        <style scoped>
          {`/* Next words */
             .timecode[data-previous-timings*="${generatePreviousTimingsUpToCurrent(currentTime)}"]{
                  color:  #9E9E9E;
              }

              // NOTE: The CSS is here, coz if you put it as a separate index.css the current webpack does not bundle it with the component

              /* TODO: Temporary, need to scope this to the component in a sensible way */
              .editor-wrapper-container {
                font-family: Roboto, sans-serif;
              }

              .editor-wrapper-container {
                padding: 8px 16px;
                height: 85vh;
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
              .timecode:hover {
                text-decoration: underline;
              }
              .timecode.text:hover {
                text-decoration: none;
              }
          `}
        </style>
        {props.showTitle && (
          <Tooltip title={<Typography variant="body1">{props.title}</Typography>}>
            <Typography variant="h5" noWrap>
              {props.title}
            </Typography>
          </Tooltip>
        )}

        <Grid container direction="row" justifycontent="center" alignItems="stretch" spacing={2}>
          <Grid item xs={12} sm={4} md={4} lg={4} xl={4} container direction="column" justifycontent="space-between" alignItems="stretch">
            <Grid container direction="column" justifycontent="flex-start" alignItems="stretch" spacing={2}>
              <Grid item container>
                <video
                  style={{ backgroundColor: 'black' }}
                  ref={mediaRef}
                  src={props.mediaUrl}
                  width={'100%'}
                  // height="auto"
                  controls
                  playsInline
                ></video>
              </Grid>
              <Grid container direction="row" justifycontent="space-between" alignItems="flex-start" spacing={1} item>
                <Grid item>
                  <p>
                    <code style={{ color: 'grey' }}>{shortTimecode(currentTime)}</code>
                    <span style={{ color: 'grey' }}> {` | `}</span>
                    <code style={{ color: 'grey' }}>{duration ? `${shortTimecode(duration)}` : '00:00:00'}</code>
                  </p>
                </Grid>
                <Grid item>
                  <FormControl>
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
                    <FormHelperText>Speed</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item>
                  <Tooltip title={<Typography variant="body1">{` Seek back by ${SEEK_BACK_SEC} seconds`}</Typography>}>
                    <Button color="primary" onClick={handleSeekBack} block="true">
                      <Replay10Icon color="primary" fontSize="large" />
                    </Button>
                  </Tooltip>
                  <Tooltip title={<Typography variant="body1">{` Fast forward by ${SEEK_BACK_SEC} seconds`}</Typography>}>
                    <Button color="primary" onClick={handleFastForward} block="true">
                      <Forward10Icon color="primary" fontSize="large" />
                    </Button>
                  </Tooltip>
                </Grid>

                <Grid item>
                  {props.isEditable && (
                    <Tooltip
                      enterDelay={3000}
                      title={
                        <Typography variant="body1">
                          {`Turn ${isPauseWhiletyping ? 'off' : 'on'} pause while typing functionality. As
                      you start typing the media while pause playback until you stop. Not
                      reccomended on longer transcript as it might present performance issues.`}
                        </Typography>
                      }
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        <Switch color="primary" checked={isPauseWhiletyping} onChange={handleSetPauseWhileTyping} />
                        Pause media while typing
                      </Typography>
                    </Tooltip>
                  )}
                </Grid>
              </Grid>

              <Grid item>
                <Tooltip
                  enterDelay={100}
                  title={
                    <Typography variant="body1">
                      {!props.isEditable && (
                        <>
                          You are in read only mode. <br />
                        </>
                      )}
                      Double click on a word or time stamp to jump to the corresponding point in the media. <br />
                      {props.isEditable && (
                        <>
                          <KeyboardIcon /> Start typing to edit text.
                          <br />
                          <PeopleIcon /> You can add and change names of speakers in your transcript.
                          <br />
                          <KeyboardReturnOutlinedIcon /> Hit enter in between words to split a paragraph.
                          <br />
                          <SaveIcon />
                          Remember to save regularly.
                          <br />
                        </>
                      )}
                      <SaveAltIcon /> Export to get a copy.
                    </Typography>
                  }
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <InfoOutlinedIcon fontSize="small" color="primary" />
                    <Typography color="primary" variant="body1">
                      How Does this work?
                    </Typography>
                  </div>
                </Tooltip>
              </Grid>
              <Grid item>
                <Link
                  color="inherit"
                  onClick={() => {
                    setShowSpeakersCheatShet(!showSpeakersCheatShet);
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    <b>Speakers</b>
                  </Typography>
                </Link>

                <Collapse in={showSpeakersCheatShet}>
                  {speakerOptions.map((speakerName, index) => {
                    return (
                      <Typography
                        variant="body2"
                        gutterBottom
                        key={index + speakerName}
                        className={'text-truncate'}
                        title={speakerName.toUpperCase()}
                      >
                        {speakerName}
                      </Typography>
                    );
                  })}
                </Collapse>
              </Grid>
              {/* <Grid item>{props.children}</Grid> */}
            </Grid>
            <Grid item>{props.children}</Grid>
          </Grid>

          <Grid item xs={12} sm={7} md={7} lg={7} xl={7}>
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
                          setIsContentSaved(true);
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

          <Grid container item xs={12} sm={1} md={1} lg={1} xl={1}>
            <SideBtns
              handleExport={handleExport}
              isProcessing={isProcessing}
              isContentModified={isContentModified}
              isContentSaved={isContentSaved}
              setIsProcessing={setIsProcessing}
              insertTextInaudible={insertTextInaudible}
              handleInsertMusicNote={handleInsertMusicNote}
              handleSplitParagraph={handleSplitParagraph}
              isPauseWhiletyping={isPauseWhiletyping}
              handleSetPauseWhileTyping={handleSetPauseWhileTyping}
              handleRestoreTimecodes={handleRestoreTimecodes}
              handleReplaceText={handleReplaceText}
              handleSave={handleSave}
              REPLACE_WHOLE_TEXT_INSTRUCTION={REPLACE_WHOLE_TEXT_INSTRUCTION}
              handleAnalyticsEvents={props.handleAnalyticsEvents}
              optionalBtns={props.optionalBtns}
              handleUndo={handleUndo}
              handleRedo={handleRedo}
              isEditable={props.isEditable}
            />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default SlateTranscriptEditor;

SlateTranscriptEditor.propTypes = {
  transcriptData: PropTypes.object.isRequired,
  mediaUrl: PropTypes.string.isRequired,
  handleSaveEditor: PropTypes.func,
  handleAutoSaveChanges: PropTypes.func,
  autoSaveContentType: PropTypes.string,
  isEditable: PropTypes.bool,
  showTimecodes: PropTypes.bool,
  showSpeakers: PropTypes.bool,
  title: PropTypes.string,
  showTitle: PropTypes.bool,
  transcriptDataLive: PropTypes.object,
};

SlateTranscriptEditor.defaultProps = {
  showTitle: false,
  showTimecodes: true,
  showSpeakers: true,
  autoSaveContentType: 'digitalpaperedit',
  isEditable: true,
};
