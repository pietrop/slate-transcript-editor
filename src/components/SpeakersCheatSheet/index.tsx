import { Collapse, Link, Typography } from '@material-ui/core';
import React from 'react';
import { useTranscriptEditorContext } from '../TranscriptEditorContext';

export function SpeakersCheatSheet(): JSX.Element {
  const context = useTranscriptEditorContext();

  return (
    <>
      <Link
        color="inherit"
        onClick={() => {
          context.setShowSpeakersCheatSheet(!context.showSpeakersCheatSheet);
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          <b>Speakers</b>
        </Typography>
      </Link>

      <Collapse in={context.showSpeakersCheatSheet}>
        {context.speakerOptions.map((speakerName, index) => {
          return (
            <Typography variant="body2" gutterBottom key={index + speakerName} className={'text-truncate'} title={speakerName.toUpperCase()}>
              {speakerName}
            </Typography>
          );
        })}
      </Collapse>
    </>
  );
}
