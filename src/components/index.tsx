import {
  Button,
  Container,
  CssBaseline,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Forward10, Replay10 } from '@material-ui/icons';
import debounce from 'lodash/debounce';
import path from 'path';
import React, { PropsWithChildren, useCallback, useEffect } from 'react';
import { Descendant, Transforms } from 'slate';
import { Editable, RenderLeafProps, Slate } from 'slate-react';
import { TranscriptWord } from 'types/slate';
import download from '../util/download/index.js';
import convertDpeToSlate from '../util/dpe-to-slate';
import generatePreviousTimingsUpToCurrent from '../util/dpe-to-slate/generate-previous-timings-up-to-current';
import exportAdapter, { ExportData, isCaptionType } from '../util/export-adapters';
import plainTextalignToSlateJs from '../util/export-adapters/slate-to-dpe/update-timestamps/plain-text-align-to-slate';
import updateBlocksTimestamps from '../util/export-adapters/slate-to-dpe/update-timestamps/update-blocks-timestamps';
import insertTimecodesInLineInSlateJs from '../util/insert-timecodes-in-line-in-words-list';
import { shortTimecode } from '../util/timecode-converter';
import { Instructions } from './Instructions/index.js';
import SideBtns from './SideBtns';
import SlateHelpers from './slate-helpers';
import { SpeakersCheatSheet } from './SpeakersCheatSheet/index.js';
import { TimedTextElement } from './TimedTextElement';
import { TranscriptEditorContextProvider, useTranscriptEditorContext } from './TranscriptEditorContext.js';

const PLAYBACK_RATE_VALUES = [0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.5];
const SEEK_BACK_SEC = 10;
const PAUSE_WHILE_TYPING_TIMEOUT_MILLISECONDS = 1500;
// const MAX_DURATION_FOR_PERFORMANCE_OPTIMIZATION_IN_SECONDS = 3600;
const REPLACE_WHOLE_TEXT_INSTRUCTION =
  'Replace whole text. \n\nAdvanced feature, if you already have an accurate transcription for the whole text, and you want to restore timecodes for it, you can use this to replace the text in this transcript. \n\nFor now this is an experimental feature. \n\nIt expects plain text, with paragraph breaks as new line breaks but no speakers.';

const mediaRef = React.createRef<HTMLVideoElement>();

const pauseWhileTyping = (current) => {
  current.play();
};
const debouncePauseWhileTyping = debounce(pauseWhileTyping, PAUSE_WHILE_TYPING_TIMEOUT_MILLISECONDS);

export interface TranscriptData {
  words?: TranscriptWord[];
  paragraphs?: TranscriptParagraph[];
}

interface TranscriptParagraph {
  id: number;
  start: number;
  end: number;
  speaker: string;
}

export interface Props {
  transcriptData: TranscriptData;
  mediaUrl: string;
  handleSaveEditor: (value: string) => void;
  handleAutoSaveChanges?: (value: Descendant[]) => void;
  autoSaveContentType: string;
  isEditable?: boolean;
  showTimecodes?: boolean;
  showSpeakers?: boolean;
  title?: string;
  showTitle?: boolean;
  transcriptDataLive?: TranscriptData;
  handleAnalyticsEvents?: (eventName: string, properties: { fn: string; [key: string]: any }) => void;
  optionalBtns?: React.ReactNode | React.ReactNodeArray;
  mediaType?: string;
}

function SlateTranscriptEditor(props: PropsWithChildren<Props>): JSX.Element {
  return (
    <TranscriptEditorContextProvider
      defaultShowSpeakers={props.showSpeakers}
      mediaRef={mediaRef}
      defaultShowTimecodes={props.showTimecodes}
      handleAnalyticsEvents={props.handleAnalyticsEvents}
    >
      <SlateTranscriptEditorInner {...props} />
    </TranscriptEditorContextProvider>
  );
}

function SlateTranscriptEditorInner(props: PropsWithChildren<Props>) {
  const context = useTranscriptEditorContext();

  useEffect(() => {
    if (context.isProcessing) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [context.isProcessing]);

  useEffect(() => {
    if (props.transcriptData) {
      const res = convertDpeToSlate(props.transcriptData);
      context.setValue(res);
    }
  }, [context, props.transcriptData]);

  // handles interim results for working with a Live STT
  useEffect(() => {
    if (props.transcriptDataLive) {
      const nodes = convertDpeToSlate(props.transcriptDataLive);
      // if the user is selecting the / typing the text
      // Transforms.insertNodes would insert the node at selection point
      // instead we check if they are in the editor
      if (context.editor.selection) {
        // get the position of the last node
        const positionLastNode = [context.editor.children.length];
        // insert the new nodes at the end of the document
        Transforms.insertNodes(context.editor, nodes, {
          at: positionLastNode,
        });
      }
      // use not having selection in the editor allows us to also handle the initial use case
      // where the might be no initial results
      else {
        // if there is no selection the default for insertNodes is to add the nodes at the end
        Transforms.insertNodes(context.editor, nodes);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.transcriptDataLive]);

  const getSlateContent = useCallback(() => {
    return context.value;
  }, [context.value]);

  const getFileName = useCallback(() => {
    return path.basename(props.mediaUrl).trim();
  }, [props.mediaUrl]);

  const getFileTitle = useCallback(() => {
    if (props.title) {
      return props.title;
    }
    return getFileName();
  }, [getFileName, props.title]);

  const handleSetPlaybackRate = useCallback(
    (e) => {
      const previousPlaybackRate = context.playbackRate;
      const n = e.target.value;
      const tmpNewPlaybackRateValue = parseFloat(n);
      if (mediaRef && mediaRef.current) {
        mediaRef.current.playbackRate = tmpNewPlaybackRateValue;
        context.setPlaybackRate(tmpNewPlaybackRateValue);

        props.handleAnalyticsEvents?.('ste_handle_set_playback_rate', {
          fn: 'handleSetPlaybackRate',
          previousPlaybackRate,
          newPlaybackRate: tmpNewPlaybackRateValue,
        });
      }
    },
    [context, props]
  );

  const handleSeekBack = () => {
    if (mediaRef && mediaRef.current) {
      const newCurrentTime = mediaRef.current.currentTime - SEEK_BACK_SEC;
      mediaRef.current.currentTime = newCurrentTime;

      props.handleAnalyticsEvents?.('ste_handle_seek_back', {
        fn: 'handleSeekBack',
        newCurrentTimeInSeconds: newCurrentTime,
        seekBackValue: SEEK_BACK_SEC,
      });
    }
  };

  const handleFastForward = () => {
    if (mediaRef && mediaRef.current) {
      const newCurrentTime = mediaRef.current.currentTime + SEEK_BACK_SEC;
      mediaRef.current.currentTime = newCurrentTime;

      props.handleAnalyticsEvents?.('ste_handle_fast_forward', {
        fn: 'handleFastForward',
        newCurrentTimeInSeconds: newCurrentTime,
        seekBackValue: SEEK_BACK_SEC,
      });
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

  const renderLeaf = useCallback(
    ({ attributes, children }: RenderLeafProps): JSX.Element => {
      return (
        <span
          onDoubleClick={context.handleTimedTextClick}
          className={'timecode text'}
          data-start={children.props.parent.start}
          data-previous-timings={children.props.parent.previousTimings}
          // title={'double click on a word to jump to the corresponding point in the media'}
          {...attributes}
        >
          {children}
        </span>
      );
    },
    [context.handleTimedTextClick]
  );

  //

  const DefaultElement = (props: {
    attributes: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    children: React.ReactNode;
  }) => {
    return <p {...props.attributes}>{props.children}</p>;
  };

  const handleReplaceText = useCallback(() => {
    const newText = prompt(`Paste the text to replace here.\n\n${REPLACE_WHOLE_TEXT_INSTRUCTION}`);
    if (newText) {
      const newValue = plainTextalignToSlateJs(props.transcriptData, newText, context.value);
      context.setValue(newValue);

      // TODO: consider adding some kind of word count here?

      // handles if click cancel and doesn't set speaker name
      props.handleAnalyticsEvents?.('ste_handle_replace_text', {
        fn: 'handleReplaceText',
      });
    }
  }, [context, props]);

  // TODO: refactor this function, to be cleaner and easier to follow.
  const handleRestoreTimecodes = useCallback(
    async (inlineTimecodes = false) => {
      // if nothing as changed and you don't need to modify the data
      // to get inline timecodes, then just return as is
      if (!context.isContentModified && !inlineTimecodes) {
        return context.value;
      }
      // only used by Word (OHMS) export
      // const alignedSlateData = await updateBloocksTimestamps(value, inlineTimecodes);
      const alignedSlateData = await updateBlocksTimestamps(context.value);
      context.setValue(alignedSlateData);
      context.setIsContentModified(false);

      if (inlineTimecodes) {
        // we don't want to show the inline timecode in the editor, but we want to return them to export function
        const alignedSlateDataWithInlineTimecodes = insertTimecodesInLineInSlateJs(alignedSlateData);
        return alignedSlateDataWithInlineTimecodes;
      }

      return alignedSlateData;
    },
    [context]
  );

  // TODO: this could be refactored, and brought some of this logic inside the exportAdapter (?)
  // To make this a little cleaner
  const handleExport = useCallback(
    async ({ type, ext, speakers, timecodes, inlineTimecodes, hideTitle, atlasFormat, isDownload }: ExportData): Promise<string> => {
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
        context.setIsProcessing(true);
        let tmpValue = getSlateContent();
        if (timecodes) {
          tmpValue = await handleRestoreTimecodes();
        }

        if (inlineTimecodes) {
          tmpValue = await handleRestoreTimecodes(inlineTimecodes);
        }

        if (context.isContentModified && type === 'json-slate') {
          tmpValue = await handleRestoreTimecodes();
        }

        if (context.isContentModified && type === 'json-digitalpaperedit') {
          tmpValue = await handleRestoreTimecodes();
        }

        if (context.isContentModified && isCaptionType(type)) {
          tmpValue = await handleRestoreTimecodes();
        }
        // export adapter does not doo any alignment
        // just converts between formats
        let editorContent = exportAdapter({
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
          editorContent = JSON.stringify(editorContent, null, 2);
        }
        if (ext !== 'docx' && isDownload) {
          download(editorContent, `${getFileTitle()}.${ext}`);
        }
        return editorContent;
      } finally {
        context.setIsProcessing(false);
      }
    },
    [context, getFileTitle, getSlateContent, handleRestoreTimecodes, props]
  );

  const handleSave = useCallback(async () => {
    try {
      context.setIsProcessing(true);
      const format = props.autoSaveContentType ? props.autoSaveContentType : 'digitalpaperedit';
      const editorContent = await handleExport({ type: `json-${format}`, isDownload: false });

      // handles if click cancel and doesn't set speaker name
      props.handleAnalyticsEvents?.('ste_handle_save', {
        fn: 'handleSave',
        format,
      });

      if (props.handleSaveEditor && props.isEditable) {
        props.handleSaveEditor(editorContent);
      }
      context.setIsContentModified(false);
      context.setIsContentSaved(true);
    } finally {
      context.setIsProcessing(false);
    }
  }, [context, handleExport, props]);

  /**
   * See explanation in `src/utils/dpe-to-slate/index.js` for how this function works with css injection
   * to provide current paragraph's highlight.
   * @param {Number} currentTime - float in seconds
   */

  const handleSetPauseWhileTyping = () => {
    if (props.handleAnalyticsEvents) {
      // handles if click cancel and doesn't set speaker name
      props.handleAnalyticsEvents('ste_handle_set_pause_while_typing', {
        fn: 'handleSetPauseWhileTyping',
        isPauseWhileTyping: !context.isPauseWhileTyping,
      });
    }
    context.setIsPauseWhileTyping(!context.isPauseWhileTyping);
  };

  // const debounced_version = throttle(handleRestoreTimecodes, 3000, { leading: false, trailing: true });
  // TODO: revisit logic for
  // - splitting paragraph via enter key
  // - merging paragraph via delete
  // - merging paragraphs via deleting across paragraphs
  const handleOnKeyDown = async (event) => {
    context.setIsContentModified(true);
    context.setIsContentSaved(false);
    //  ArrowRight ArrowLeft ArrowUp ArrowUp
    if (event.key === 'Enter') {
      // intercept Enter, and handle timecodes when splitting a paragraph
      event.preventDefault();
      // console.info('For now disabling enter key to split a paragraph, while figuring out the alignment issue');
      // handleSetPauseWhileTyping();
      // TODO: Edge case, hit enters after having typed some other words?
      const isSuccess = SlateHelpers.handleSplitParagraph(context.editor);
      if (props.handleAnalyticsEvents) {
        // handles if click cancel and doesn't set speaker name
        props.handleAnalyticsEvents('ste_handle_split_paragraph', {
          fn: 'handleSplitParagraph',
          isSuccess,
        });
      }
      if (isSuccess) {
        // as part of splitting paragraphs there's an alignment step
        // so content is not counted as modified
        context.setIsContentModified(false);
      }
    }
    if (event.key === 'Backspace') {
      const isSuccess = SlateHelpers.handleDeleteInParagraph({ editor: context.editor, event });
      // Commenting that out for now, as it might get called too often
      // if (props.handleAnalyticsEvents) {
      //   // handles if click cancel and doesn't set speaker name
      //   props.handleAnalyticsEvents('ste_handle_delete_paragraph', {
      //     fn: 'handleDeleteInParagraph',
      //     isSuccess,
      //   });
      // }
      if (isSuccess) {
        // as part of splitting paragraphs there's an alignment step
        // so content is not counted as modified
        context.setIsContentModified(false);
      }
    }
    // if (event.key.length == 1 && ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 49 && event.keyCode <= 57))) {
    //   const alignedSlateData = await debouncedSave(value);
    //   setValue(alignedSlateData);
    //   setIsContentIsModified(false);
    // }

    if (context.isPauseWhileTyping) {
      // logic for pause while typing
      // https://schier.co/blog/wait-for-user-to-stop-typing-using-javascript
      // TODO: currently eve the video was paused, and pause while typing is on,
      // it will play it when stopped typing. so added btn to turn feature on off.
      // and disabled as default.
      // also pause while typing might introduce performance issues on longer transcripts
      // if on every keystroke it's creating and destroying a timer.
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
             .timecode[data-previous-timings*="${generatePreviousTimingsUpToCurrent(context.currentTime)}"]{
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

        <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={2}>
          <Grid item xs={12} sm={4} md={4} lg={4} xl={4} container direction="column" justifyContent="space-between" alignItems="stretch">
            <Grid container direction="column" justifyContent="flex-start" alignItems="stretch" spacing={2}>
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
              <Grid container direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} item>
                <Grid item>
                  <p>
                    <code style={{ color: 'grey' }}>{shortTimecode(context.currentTime)}</code>
                    <span style={{ color: 'grey' }}> {' | '}</span>
                    <code style={{ color: 'grey' }}>{context.duration ? `${shortTimecode(context.duration)}` : '00:00:00'}</code>
                  </p>
                </Grid>
                <Grid item>
                  <FormControl>
                    <Select labelId="demo-simple-select-label" id="demo-simple-select" value={context.playbackRate} onChange={handleSetPlaybackRate}>
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
                    <Button color="primary" onClick={handleSeekBack}>
                      <Replay10 color="primary" fontSize="large" />
                    </Button>
                  </Tooltip>
                  <Tooltip title={<Typography variant="body1">{` Fast forward by ${SEEK_BACK_SEC} seconds`}</Typography>}>
                    <Button color="primary" onClick={handleFastForward}>
                      <Forward10 color="primary" fontSize="large" />
                    </Button>
                  </Tooltip>
                </Grid>

                <Grid item>
                  {props.isEditable && (
                    <Tooltip
                      enterDelay={3000}
                      title={
                        <Typography variant="body1">
                          {`Turn ${context.isPauseWhileTyping ? 'off' : 'on'} pause while typing functionality. As
                      you start typing the media while pause playback until you stop. Not
                      recommended on longer transcript as it might present performance issues.`}
                        </Typography>
                      }
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        <Switch color="primary" checked={context.isPauseWhileTyping} onChange={handleSetPauseWhileTyping} />
                        Pause media while typing
                      </Typography>
                    </Tooltip>
                  )}
                </Grid>
              </Grid>

              <Grid item>
                <Instructions />
              </Grid>
              <Grid item>
                <SpeakersCheatSheet />
              </Grid>
            </Grid>
            <Grid item>{props.children}</Grid>
          </Grid>

          <Grid item xs={12} sm={7} md={7} lg={7} xl={7}>
            {context.value.length !== 0 ? (
              <>
                <Paper elevation={3}>
                  <section className="editor-wrapper-container">
                    <Slate
                      editor={context.editor}
                      value={context.value}
                      onChange={(value) => {
                        if (props.handleAutoSaveChanges) {
                          props.handleAutoSaveChanges(value);
                          context.setIsContentSaved(true);
                        }
                        return context.setValue(value);
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
              handleReplaceText={handleReplaceText}
              handleSave={handleSave}
              REPLACE_WHOLE_TEXT_INSTRUCTION={REPLACE_WHOLE_TEXT_INSTRUCTION}
            >
              {props.optionalBtns}
            </SideBtns>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default SlateTranscriptEditor;

SlateTranscriptEditor.defaultProps = {
  showTitle: false,
  showTimecodes: true,
  showSpeakers: true,
  autoSaveContentType: 'digitalpaperedit',
  isEditable: true,
};
