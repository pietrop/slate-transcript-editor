import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import path from 'path';
import { faSave, faFileDownload, faUndo, faSync, faInfoCircle, faPause } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { shortTimecode } from '../../util/timecode-converter';
import download from '../../util/downlaod/index.js';
import convertDpeToSlate from '../../util/dpe-to-slate';
// TODO: This should be moved in export utils
import insertTimecodesInline from '../../util/inline-interval-timecodes';
import pluck from '../../util/pluk';
import subtitlesExportOptionsList from '../../util/export-adapters/subtitles-generator/list.js';
import updateTimestamps from '../../util/export-adapters/slate-to-dpe/update-timestamps';
import updateTimestampsHelper from '../../util/export-adapters/slate-to-dpe/update-timestamps/update-timestamps-helper';
import { createDpeParagraphsFromSlateJs } from '../../util/export-adapters/slate-to-dpe';
import exportAdapter from '../../util/export-adapters';
import TimedTextEditor from '../TimedTextEditor';
// TODO: if this works out, remove PageWrapper, and move these two functions
// in this folder
import divideDpeTranscriptIntoChunks from '../PageWrapper/divide-dpe-transcript-into-chunks';
import chunkParagraphs from '../PageWrapper/chunk-paragraphs';
import chunkParagraphsFromDpeToSlateList from '../PageWrapper/chunk-paragraphs-from-dpe-to-slate-list';

const PLAYBACK_RATE_VALUES = [0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.5];
const SEEK_BACK_SEC = 15;
const TOOTLIP_DELAY = 1000;
const TOOTLIP_LONGER_DELAY = 2000;

const mediaRef = React.createRef();

export default function TranscriptEditor(props) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  // const [value, setValue] = useState([]);
  const defaultShowSpeakersPreference = typeof props.showSpeakers === 'boolean' ? props.showSpeakers : true;
  const defaultShowTimecodesPreference = typeof props.showTimecodes === 'boolean' ? props.showTimecodes : true;
  const [showSpeakers, setShowSpeakers] = useState(defaultShowSpeakersPreference);
  const [showTimecodes, setShowTimecodes] = useState(defaultShowTimecodesPreference);
  const [speakerOptions, setSpeakerOptions] = useState([]);
  const [showSpeakersCheatShet, setShowSpeakersCheatShet] = useState(false);
  const [isPauseWhiletyping, setIsPauseWhiletyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // used isContentModified to avoid unecessarily run alignment if the slate value contnet has not been modified by the user since
  // last save or alignment
  const [isContentModified, setIsContentIsModified] = useState(false);
  //
  const [key, setKey] = useState(0);
  const { transcriptData } = props;
  const wordsChunk = divideDpeTranscriptIntoChunks(transcriptData);
  const transcriptsChunksTmp = chunkParagraphs(wordsChunk, transcriptData.paragraphs);
  const transcriptsChunksAsSlate = chunkParagraphsFromDpeToSlateList(transcriptsChunksTmp);
  const [transcriptsChunks, setTranscriptsChunks] = useState(transcriptsChunksAsSlate);
  const currentChunk = transcriptsChunks[0];
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0);
  const [currentTranscriptChunk, setCurrentTranscriptChunk] = useState(currentChunk);

  useEffect(() => {
    if (isProcessing) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [isProcessing]);

  // useEffect(() => {
  //   if (props.transcriptData) {
  //     const res = convertDpeToSlate(props.transcriptData);
  //     setValue(res);
  //   }
  // }, []);

  // useEffect(() => {
  //   const getUniqueSpeakers = pluck('speaker');
  //   const uniqueSpeakers = getUniqueSpeakers(value);
  //   setSpeakerOptions(uniqueSpeakers);
  //   return () => ({});
  // }, [showSpeakersCheatShet]);

  useEffect(() => {
    // Update the document title using the browser API
    if (mediaRef && mediaRef.current) {
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
    }
  }, [mediaRef]);

  // for tabs logic
  const handleOnSelect = (k) => {
    setKey(k);
    setCurrentTranscriptIndex(parseInt(k));
    const tmp = transcriptsChunks[parseInt(k)];
    setCurrentTranscriptChunk(tmp);
  };

  const getSlateContent = () => {
    // TODO: recombine transcriptsChunks
    // return value;
    return [];
  };

  const getFileTitle = () => {
    if (props.title) {
      return props.title;
    }
    return path.basename(props.mediaUrl).trim();
  };

  const handleSetShowSpeakersCheatShet = () => {
    setShowSpeakersCheatShet(!showSpeakersCheatShet);
  };

  const handleTimeUpdated = (e) => {
    setCurrentTime(e.target.currentTime);
    // TODO: setting duration here as a workaround
    setDuration(mediaRef.current.duration);
  };

  const handleSetPlaybackRate = (e) => {
    const tmpNewPlaybackRateValue = parseFloat(e.target.value);
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

  const onWordClick = (start) => {
    if (mediaRef && mediaRef.current) {
      mediaRef.current.currentTime = parseFloat(start);
      mediaRef.current.play();
    }
  };

  // TODO: refacto this function, to be cleaner and easier to follow.
  const handleRestoreTimecodes = async (inlineTimecodes = false) => {
    console.log('handleRestoreTimecodes');
    // if (!isContentModified && !inlineTimecodes) {
    //   // return value;
    // }
    // if (inlineTimecodes) {
    //   const transcriptData = insertTimecodesInline({ transcriptData: props.transcriptData });
    //   const alignedSlateData = await updateTimestamps(convertDpeToSlate(transcriptData), transcriptData);
    //   setValue(alignedSlateData);
    //   setIsContentIsModified(false);
    //   return alignedSlateData;
    // } else {
    //   const alignedSlateData = await updateTimestamps(value, props.transcriptData);
    //   setValue(alignedSlateData);
    //   setIsContentIsModified(false);
    //   return alignedSlateData;
    // }
  };

  const handleExport = async ({ type, ext, speakers, timecodes, inlineTimecodes, hideTitle, atlasFormat, isDownload }) => {
    console.log('handleExport');
    // try {
    //   setIsProcessing(true);
    //   let tmpValue = getSlateContent();
    //   if (timecodes) {
    //     tmpValue = await handleRestoreTimecodes();
    //   }

    //   if (inlineTimecodes) {
    //     tmpValue = await handleRestoreTimecodes(inlineTimecodes);
    //   }

    //   if (isContentModified && type === 'json-slate') {
    //     tmpValue = await handleRestoreTimecodes();
    //   }

    //   let editorContent = exportAdapter({
    //     slateValue: tmpValue,
    //     type,
    //     transcriptTitle: getFileTitle(),
    //     speakers,
    //     timecodes,
    //     inlineTimecodes,
    //     hideTitle,
    //     atlasFormat,
    //     dpeTranscriptData: props.transcriptData,
    //   });

    //   if (ext === 'json') {
    //     editorContent = JSON.stringify(editorContent, null, 2);
    //   }
    //   if (ext !== 'docx' && isDownload) {
    //     download(editorContent, `${getFileTitle()}.${ext}`);
    //   }
    //   return editorContent;
    // } finally {
    //   setIsProcessing(false);
    // }
  };

  const handleSaveEditor = () => {
    console.log('handleSaveEditor');
    // console.log('PageWrapper, handleSaveEditor', data);
    // transcriptsChunks[currentTranscriptIndex] = data;
    // setTranscriptsChunks(transcriptsChunks);
    // setCurrentTranscriptChunk(data);
    // props.handleSaveEditor(data);
  };

  const handleSave = async () => {
    console.log('handleSave');

    // const alignedWords = updateTimestampsHelper(value, props.transcriptData);
    // const editorContent = (value, alignedWords);
    // setValue(editorContent);
    // setIsContentIsModified(false);

    // const format = props.autoSaveContentType ? props.autoSaveContentType : 'digitalpaperedit';
    // if (format === 'digitalpaperedit') {
    //   const editorContentInDpe = createDpeParagraphsFromSlateJs(value, alignedWords);
    //   if (props.handleSaveEditor) {
    //     const dpeTranscript = { paragraphs: editorContentInDpe, words: alignedWords };
    //     props.handleSaveEditor(dpeTranscript);
    //   }
    // } else {
    //   if (props.handleSaveEditor) {
    //     props.handleSaveEditor(editorContent);
    //   }
    // }
  };

  const handleSetPauseWhileTyping = () => {
    setIsPauseWhiletyping(!isPauseWhiletyping);
  };

  const handleAutoSaveChanges = (value) => {
    // if (props.handleAutoSaveChanges) {
    //   props.handleAutoSaveChanges(value);
    // }
    // setIsContentIsModified(true);
    // setValue(value);
  };

  return (
    <Container fluid style={{ backgroundColor: '#eee', height: '100vh', paddingTop: '1em' }}>
      {props.showTitle ? (
        <OverlayTrigger delay={TOOTLIP_LONGER_DELAY} placement={'bottom'} overlay={<Tooltip id="tooltip-disabled"> {props.title}</Tooltip>}>
          <h3 className={'text-truncate text-left'}>
            <small className="text-muted">{props.title}</small>
          </h3>
        </OverlayTrigger>
      ) : null}
      <Row>
        <Col xs={{ span: 12, order: 1 }} sm={3} md={3} lg={3} xl={3}>
          <Row style={{ backgroundColor: 'black' }}>
            <video
              ref={mediaRef}
              src={props.mediaUrl}
              width={'100%'}
              height={'auto'}
              controls
              playsInline
              // poster={'https://video-react.js.org/assets/poster.png'}
            ></video>
          </Row>
          <Row>
            <Col xs={5} sm={4} md={4} lg={4} xl={4} className={'p-1 mx-auto'}>
              <Badge variant="light" pill>
                <code className={'text-muted'}>{shortTimecode(currentTime)}</code>
                <code className={'text-muted'}>{duration ? ` | ${shortTimecode(duration)}` : ''}</code>
              </Badge>
            </Col>
            <Col xs={4} sm={4} md={4} lg={4} xl={4} className={'p-1 mx-auto'}>
              <Form.Control
                as="select"
                defaultValue={playbackRate}
                onChange={handleSetPlaybackRate}
                title={'Change the playback speed of the player'}
              >
                {PLAYBACK_RATE_VALUES.map((playbackRateValue, index) => {
                  return (
                    <option key={index + playbackRateValue} value={playbackRateValue}>
                      x {playbackRateValue}
                    </option>
                  );
                })}
              </Form.Control>
            </Col>
            <Col xs={3} sm={3} md={3} lg={3} xl={3} className={'p-1 mx-auto'}>
              <OverlayTrigger
                delay={TOOTLIP_DELAY}
                placement={'bottom'}
                overlay={<Tooltip id="tooltip-disabled">{`Seek back by ${SEEK_BACK_SEC} seconds`}</Tooltip>}
              >
                <span className="d-inline-block">
                  <Button variant="light" onClick={handleSeekBack} block>
                    {SEEK_BACK_SEC} <FontAwesomeIcon icon={faUndo} />
                  </Button>
                </span>
              </OverlayTrigger>
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
              <Accordion onClick={handleSetShowSpeakersCheatShet}>
                <Accordion.Toggle as={Button} variant="link" eventKey="0">
                  <Badge variant="light">Speakers</Badge>
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
              </Accordion>
            </Col>
          </Row>
        </Col>

        <Col xs={{ span: 12, order: 3 }} sm={{ span: 7, order: 2 }} md={{ span: 7, order: 2 }} lg={{ span: 8, order: 2 }} xl={{ span: 7, order: 2 }}>
          {transcriptsChunks.length > 1 && (
            <Tabs id="controlled-tab-example" activeKey={key} onSelect={handleOnSelect}>
              {transcriptsChunks.map((chunk, index) => {
                // const startTime = chunk.words[0].start;
                const startTime = chunk[0].startTimecode;
                // const endTime = chunk.words[chunk.words.length - 1].end;
                // const endTime = chunk[chunk.length - 1].startTimecode;
                return (
                  <Tab eventKey={index} index={index} title={`${startTime}`}>
                    {/* This is so that we don't load the editor's for tabs that are not in view */}
                    {/* {currentTranscriptIndex === index && ( */}
                    <>
                      <TimedTextEditor
                        mediaUrl={props.mediaUrl}
                        isEditable={props.isEditable}
                        autoSaveCsontentType={props.autoSaveContentType}
                        showTimecodes={showTimecodes}
                        showSpeakers={showSpeakers}
                        // transcriptData={props.transcriptData}
                        // transcriptData={chunk}
                        value={chunk}
                        // handleSaveEditor={handleSaveEditor}
                        handleSaveEditor={handleSaveEditor}
                        handleAutoSaveChanges={handleAutoSaveChanges}
                        showTitle={props.showTitle}
                        currentTime={currentTime}
                        //
                        isPauseWhiletyping={isPauseWhiletyping}
                        onWordClick={onWordClick}
                        handleAnalyticsEvents={props.handleAnalyticsEvents}
                        mediaRef={mediaRef}
                        transcriptDataLive={props.transcriptDataLive}
                      />
                    </>
                    {/* )} */}
                  </Tab>
                );
              })}
            </Tabs>
          )}

          {transcriptsChunks.length === 1 && (
            <TimedTextEditor
              mediaUrl={props.mediaUrl}
              isEditable={props.isEditable}
              autoSaveCsontentType={props.autoSaveContentType}
              showTimecodes={showTimecodes}
              showSpeakers={showSpeakers}
              // transcriptData={props.transcriptData}
              // transcriptData={currentTranscriptChunk}
              value={currentTranscriptChunk}
              // handleSaveEditor={handleSaveEditor}
              handleSaveEditor={handleSaveEditor}
              handleAutoSaveChanges={handleAutoSaveChanges}
              showTitle={props.showTitle}
              currentTime={currentTime}
              //
              isPauseWhiletyping={isPauseWhiletyping}
              onWordClick={onWordClick}
              handleAnalyticsEvents={props.handleAnalyticsEvents}
              mediaRef={mediaRef}
              transcriptDataLive={props.transcriptDataLive}
            />
          )}
        </Col>
        <Col xs={{ span: 12, order: 2 }} sm={{ span: 2, order: 3 }} md={{ span: 2, order: 3 }} lg={{ span: 1, order: 3 }} xl={{ span: 2, order: 3 }}>
          <Row>
            <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
              <OverlayTrigger
                OverlayTrigger
                delay={TOOTLIP_LONGER_DELAY}
                placement={'bottom'}
                overlay={<Tooltip id="tooltip-disabled">Export options</Tooltip>}
              >
                <span className="d-inline-block">
                  <DropdownButton
                    disabled={isProcessing}
                    id="dropdown-basic-button"
                    title={<FontAwesomeIcon icon={faFileDownload} />}
                    variant="light"
                  >
                    <Dropdown.Item style={{ color: 'black' }} disabled>
                      <b>Text Export</b>
                    </Dropdown.Item>
                    {/* TODO: need to run re-alignement if exportin with timecodes true, otherwise they'll be inaccurate */}
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'text',
                          ext: 'txt',
                          speakers: false,
                          timecodes: false,
                          isDownload: true,
                        });
                      }}
                    >
                      Text (<code>.txt</code>)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'text',
                          ext: 'txt',
                          speakers: true,
                          timecodes: false,
                          isDownload: true,
                        });
                      }}
                    >
                      Text (Speakers)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'text',
                          ext: 'txt',
                          speakers: false,
                          timecodes: true,
                          isDownload: true,
                        });
                      }}
                    >
                      Text (Timecodes)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'text',
                          ext: 'txt',
                          speakers: true,
                          timecodes: true,
                          isDownload: true,
                        });
                      }}
                      disable
                    >
                      Text (Speakers & Timecodes)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'text',
                          ext: 'txt',
                          speakers: true,
                          timecodes: true,
                          atlasFormat: true,
                          isDownload: true,
                        });
                      }}
                      disable
                    >
                      Text (Atlas format)
                    </Dropdown.Item>
                    {/* TODO: need to run re-alignement if exportin with timecodes true */}
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'word',
                          ext: 'docx',
                          speakers: false,
                          timecodes: false,
                          isDownload: true,
                        });
                      }}
                    >
                      Word (<code>.docx</code>)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'word',
                          ext: 'docx',
                          speakers: true,
                          timecodes: false,
                          isDownload: true,
                        });
                      }}
                    >
                      Word (Speakers)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'word',
                          ext: 'docx',
                          speakers: false,
                          timecodes: true,
                          isDownload: true,
                        });
                      }}
                    >
                      Word (Timecodes)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'word',
                          ext: 'docx',
                          speakers: true,
                          timecodes: true,
                          isDownload: true,
                        });
                      }}
                    >
                      Word (Speakers & Timecodes)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'word',
                          ext: 'docx',
                          speakers: false,
                          timecodes: false,
                          inlineTimecodes: true,
                          hideTitle: true,
                        });
                      }}
                    >
                      Word (OHMS)
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item style={{ color: 'black' }} disabled>
                      <b>Closed Captions Export</b>
                    </Dropdown.Item>
                    {subtitlesExportOptionsList.map(({ type, label, ext }, index) => {
                      return (
                        <Dropdown.Item
                          key={index + label}
                          onClick={() => {
                            handleExport({ type, ext, isDownload: true });
                          }}
                        >
                          {label} (<code>.{ext}</code>)
                        </Dropdown.Item>
                      );
                    })}
                    <Dropdown.Divider />
                    <Dropdown.Item style={{ color: 'black' }} disabled>
                      <b>Developer options</b>
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'json-slate',
                          ext: 'json',
                          speakers: true,
                          timecodes: true,
                          isDownload: true,
                        });
                      }}
                    >
                      SlateJs (<code>.json</code>)
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        handleExport({
                          type: 'json-digitalpaperedit',
                          ext: 'json',
                          speakers: true,
                          timecodes: true,
                          isDownload: true,
                        });
                      }}
                    >
                      DPE (<code>.json</code>)
                    </Dropdown.Item>
                  </DropdownButton>
                </span>
              </OverlayTrigger>
            </Col>
            <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
              <OverlayTrigger
                OverlayTrigger
                delay={TOOTLIP_LONGER_DELAY}
                placement={'bottom'}
                overlay={<Tooltip id="tooltip-disabled">Save</Tooltip>}
              >
                <Button
                  // disabled={isProcessing}
                  onClick={handleSaveEditor}
                  variant="light"
                >
                  <FontAwesomeIcon icon={faSave} />
                </Button>
              </OverlayTrigger>
            </Col>
            <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
              <OverlayTrigger
                delay={TOOTLIP_DELAY}
                placement={'bottom'}
                overlay={
                  <Tooltip id="tooltip-disabled">
                    Turn {isPauseWhiletyping ? 'off' : 'on'} pause while typing functionality. As you start typing the media while pause playback
                    until you stop. Not reccomended on longer transcript as it might present performance issues.
                  </Tooltip>
                }
              >
                <Button disabled={isProcessing} onClick={handleSetPauseWhileTyping} variant={isPauseWhiletyping ? 'secondary' : 'light'}>
                  <FontAwesomeIcon icon={faPause} />
                </Button>
              </OverlayTrigger>
            </Col>
            <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
              <OverlayTrigger
                delay={TOOTLIP_DELAY}
                placement={'bottom'}
                overlay={
                  <Tooltip id="tooltip-disabled">
                    Restore timecodes. At the moment for transcript over 1hour it could temporarily freeze the UI for a few seconds
                  </Tooltip>
                }
              >
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
                  variant="light"
                >
                  <FontAwesomeIcon icon={faSync} />
                </Button>
              </OverlayTrigger>
            </Col>
            <Col xs={2} sm={12} md={12} lg={12} xl={12} className={'p-1 mx-auto'}>
              <OverlayTrigger
                placement={'bottom'}
                overlay={
                  <Tooltip id="tooltip-disabled">
                    Double click on a paragraph to jump to the corresponding point at the beginning of that paragraph in the media
                  </Tooltip>
                }
              >
                {/* <span className="d-inline-block"> */}
                <Button disabled={isProcessing} variant="light">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </Button>
                {/* </span> */}
              </OverlayTrigger>
            </Col>
          </Row>
          <br />
        </Col>
      </Row>
    </Container>
  );
}

TranscriptEditor.propTypes = {
  transcriptData: PropTypes.object.isRequired,
  mediaUrl: PropTypes.string.isRequired,
  // handleSaveEditor: PropTypes.func,
  handleAutoSaveChanges: PropTypes.func,
  autoSaveContentType: PropTypes.string,
  isEditable: PropTypes.boolean,
  showTimecodes: PropTypes.boolean,
  showSpeakers: PropTypes.boolean,
  title: PropTypes.string,
  showTitle: PropTypes.boolean,
  mediaType: PropTypes.string,
  transcriptDataLive: PropTypes.object,
};

TranscriptEditor.defaultProps = {
  showTitle: false,
  showTimecodes: true,
  showSpeakers: true,
  mediaType: 'digitalpaperedit',
  isEditable: true,
};
