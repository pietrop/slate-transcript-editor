import { Button, Divider, Grid, Link, Menu, MenuItem, Tooltip, Typography } from '@material-ui/core';
import {
  EmojiSymbolsOutlined,
  ImportExport,
  KeyboardArrowDown,
  MusicNoteOutlined,
  Redo,
  SaveAlt,
  SaveOutlined,
  UndoOutlined,
} from '@material-ui/icons';
import React, { PropsWithChildren, useState } from 'react';
import { ExportData } from 'util/export-adapters/index.js';
import subtitlesExportOptionsList from '../../util/export-adapters/subtitles-generator/list.js';
import { useTranscriptEditorContext } from '../TranscriptEditorContext';

function SideBtns({
  handleExport,
  handleReplaceText,
  handleSave,
  REPLACE_WHOLE_TEXT_INSTRUCTION,
  children,
}: PropsWithChildren<{
  handleExport: (data: ExportData) => Promise<string>;
  handleReplaceText: () => void;
  handleSave: () => void;
  REPLACE_WHOLE_TEXT_INSTRUCTION: string;
}>): JSX.Element {
  const { editor, isProcessing, isContentSaved, isEditable, insertMusicNote, insertTextInaudible } = useTranscriptEditorContext();
  const [anchorMenuEl, setAnchorMenuEl] = useState(null);

  // used by MUI export menu
  const handleMenuClose = () => {
    setAnchorMenuEl(null);
  };

  // used by MUI export menu
  const handleMenuClick = (event) => {
    setAnchorMenuEl(event.currentTarget);
  };

  const handleUndo = () => {
    editor.undo();
  };

  const handleRedo = () => {
    editor.redo();
  };

  return (
    <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
      <Grid item>
        <Tooltip title={<Typography variant="body1">Export options</Typography>}>
          <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleMenuClick}>
            <SaveAlt color="primary" /> <KeyboardArrowDown color="primary" />
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
            <Link color="primary"> Text (Speakers &amp; Timecodes)</Link>
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

        {isEditable && (
          <Tooltip title={<Typography variant="body1">save</Typography>}>
            <Button disabled={isProcessing} onClick={handleSave} color="primary">
              <SaveOutlined color={isContentSaved ? 'primary' : 'secondary'} />
            </Button>
          </Tooltip>
        )}
      </Grid>
      {isEditable && (
        <>
          {/* TODO: disabling until find a way to handle timecodes and alignment on paragraph break */}
          {/* <Tooltip
        title={`To insert a paragraph break, and split a paragraph in two, put the cursor at a point where you'd want to add a paragraph break in the text and either click this button or hit enter key`}
      >
        <Button disabled={isProcessing} onClick={handleSplitParagraph} color="primary">
          <KeyboardReturnOutlinedIcon color="primary" />
        </Button>
      </Tooltip> */}
          {/*  */}
          <Grid item>
            <br />
          </Grid>
          <Grid item>
            <Tooltip
              title={
                <Typography variant="body1">
                  Put the cursor at a point where you&apos;d want to add [INAUDIBLE] text, and click this button
                </Typography>
              }
            >
              <Button disabled={isProcessing} onClick={insertTextInaudible} color="primary">
                <EmojiSymbolsOutlined color="primary" />
              </Button>
            </Tooltip>

            <Tooltip title={<Typography variant="body1">Insert a ♪ in the text</Typography>}>
              <Button disabled={isProcessing} onClick={insertMusicNote} color="primary">
                <MusicNoteOutlined color="primary" />
              </Button>
            </Tooltip>
          </Grid>

          {/*  */}
          <Grid item>
            <br />
          </Grid>
          <Grid item>
            <Tooltip
              title={
                <Typography variant="body1">
                  Undo <br />
                  <code>cmd</code> <code>z</code>
                </Typography>
              }
            >
              <Button onClick={handleUndo} color="primary">
                <UndoOutlined color="primary" />
              </Button>
            </Tooltip>

            <Tooltip
              title={
                <Typography variant="body1">
                  Redo <br /> <code>cmd</code> <code>shift</code> <code>z</code>
                </Typography>
              }
            >
              <Button onClick={handleRedo} color="primary">
                <Redo color="primary" />
              </Button>
            </Tooltip>
          </Grid>
          {/* <Tooltip
        title={
          ' Restore timecodes. At the moment for transcript over 1hour it could temporarily freeze the UI for a few seconds'
        }
      >
        <Button
          disabled={isProcessing}
          onClick={async () => {
            try {
              setIsProcessing(true);
              await handleRestoreTimecodes();
              if (handleAnalyticsEvents) {
                // handles if click cancel and doesn't set speaker name
                handleAnalyticsEvents('ste_handle_restore_timecodes_btn', {
                  fn: 'handleRestoreTimecodes',
                });
              }
            } finally {
              setIsProcessing(false);
            }
          }}
          color="primary"
        >
          <CachedOutlinedIcon
            color={'primary'}
            // color={isContentModified ? 'secondary' : 'primary'}
          />
        </Button>
      </Tooltip> */}
          {/*  */}
          <Grid item>
            <br />
          </Grid>
          <Grid item>
            <Tooltip title={<Typography variant="body1">{REPLACE_WHOLE_TEXT_INSTRUCTION}</Typography>}>
              <Button onClick={handleReplaceText} color="primary">
                <ImportExport color="primary" />
              </Button>
            </Tooltip>
          </Grid>
          {/* <Tooltip title={' Double click on a word to jump to the corresponding point in the media'}>
        <Button disabled={isProcessing} color="primary">
          <InfoOutlined color="primary" />
        </Button>
      </Tooltip> */}
        </>
      )}
      <Grid item>
        <br />
      </Grid>
      <Grid item>{children}</Grid>
    </Grid>
  );
}

export default SideBtns;
