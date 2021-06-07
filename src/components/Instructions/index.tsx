import { Tooltip, Typography } from '@material-ui/core';
import { InfoOutlined, Keyboard, KeyboardReturnOutlined, People, Save, SaveAlt } from '@material-ui/icons';
import { useTranscriptEditorContext } from 'components/TranscriptEditorContext';
import React from 'react';

export function Instructions(): JSX.Element {
  const context = useTranscriptEditorContext();

  return (
    <Tooltip
      enterDelay={100}
      title={
        <Typography variant="body1">
          {!context.isEditable && (
            <>
              You are in read only mode. <br />
            </>
          )}
          Double click on a word or time stamp to jump to the corresponding point in the media. <br />
          {context.isEditable && (
            <>
              <Keyboard /> Start typing to edit text.
              <br />
              <People /> You can add and change names of speakers in your transcript.
              <br />
              <KeyboardReturnOutlined /> Hit enter in between words to split a paragraph.
              <br />
              <Save />
              Remember to save regularly.
              <br />
            </>
          )}
          <SaveAlt /> Export to get a copy.
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
        <InfoOutlined fontSize="small" color="primary" />
        <Typography color="primary" variant="body1">
          How Does this work?
        </Typography>
      </div>
    </Tooltip>
  );
}
