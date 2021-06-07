import { Grid, GridProps, GridSize, Typography } from '@material-ui/core';
import React from 'react';
import { Editor, Element, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useTranscriptEditorContext } from '../TranscriptEditorContext.js';

export function TimedTextElement({
  showSpeakers,
  showTimecodes,
  ...props
}: {
  element: Element;
  attributes: GridProps;
  children: React.ReactNode;
  showSpeakers: boolean;
  showTimecodes: boolean;
}): JSX.Element {
  const context = useTranscriptEditorContext();

  /**
   * `handleSetSpeakerName` is outside of TimedTextElement
   * to improve the overall performance of the editor,
   * especially on long transcripts
   * @param {*} element - props.element, from `renderElement` function
   */
  const handleSetSpeakerName = (element) => {
    if (context.isEditable) {
      const pathToCurrentNode = ReactEditor.findPath(context.editor, element);
      const oldSpeakerName = element.speaker;
      const newSpeakerName = prompt('Change speaker name', oldSpeakerName);
      if (newSpeakerName) {
        const isUpdateAllSpeakerInstances = confirm(`Would you like to replace all occurrences of ${oldSpeakerName} with ${newSpeakerName}?`);

        // handles if set speaker name, and whether updates one or multiple
        context.handleAnalyticsEvents?.('ste_set_speaker_name', {
          fn: 'handleSetSpeakerName',
          changeSpeaker: true,
          updateMultiple: isUpdateAllSpeakerInstances,
        });

        if (isUpdateAllSpeakerInstances) {
          const rangeForTheWholeEditor = Editor.range(context.editor, []);
          // Apply transformation to the whole doc, where speaker matches old speaker name, and set it to new one
          Transforms.setNodes(
            context.editor,
            { type: 'timedText', speaker: newSpeakerName },
            {
              at: rangeForTheWholeEditor,
              match: (node: Element) => node.type === 'timedText' && node.speaker.toLowerCase() === oldSpeakerName.toLowerCase(),
            }
          );
        } else {
          // only apply speaker name transformation to current element
          Transforms.setNodes(context.editor, { type: 'timedText', speaker: newSpeakerName }, { at: pathToCurrentNode });
        }
      } else {
        // handles if click cancel and doesn't set speaker name
        context.handleAnalyticsEvents?.('ste_set_speaker_name', {
          fn: 'handleSetSpeakerName',
          changeSpeaker: false,
          updateMultiple: false,
        });
      }
    }
  };

  let textLg: GridSize = 12;
  let textXl: GridSize = 12;
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
    <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start" {...props.attributes}>
      {showTimecodes && (
        <Grid item contentEditable={false} xs={4} sm={3} md={3} lg={2} xl={2} className={'p-t-2 text-truncate'}>
          <code
            contentEditable={false}
            style={{ cursor: 'pointer' }}
            className={'timecode text-muted unselectable'}
            onClick={context.handleTimedTextClick}
            // onClick={(e) => {
            //   e.preventDefault();
            // }}
            onDoubleClick={context.handleTimedTextClick}
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
}
