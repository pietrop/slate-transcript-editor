import React, { useState, useEffect } from 'react';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import KeyboardReturnOutlinedIcon from '@material-ui/icons/KeyboardReturnOutlined';
import MusicNoteOutlinedIcon from '@material-ui/icons/MusicNoteOutlined';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import CachedOutlinedIcon from '@material-ui/icons/CachedOutlined';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import RedoIcon from '@material-ui/icons/Redo';
import UndoOutlinedIcon from '@material-ui/icons/UndoOutlined';
import EmojiSymbolsOutlinedIcon from '@material-ui/icons/EmojiSymbolsOutlined';
import subtitlesExportOptionsList from '../../util/export-adapters/subtitles-generator/list.js';

function SideBtns({
  handleExport,
  isProcessing,
  isContentModified,
  isContentSaved,
  setIsProcessing,
  insertTextInaudible,
  handleInsertMusicNote,
  handleSplitParagraph,
  handleRestoreTimecodes,
  handleReplaceText,
  handleSave,
  handleAnalyticsEvents,
  REPLACE_WHOLE_TEXT_INSTRUCTION,
  optionalBtns,
  handleUndo,
  handleRedo,
  isEditable,
}) {
  const [anchorMenuEl, setAnchorMenuEl] = useState(null);

  // used by MUI export menu
  const handleMenuClose = () => {
    setAnchorMenuEl(null);
  };

  // used by MUI export menu
  const handleMenuClick = (event) => {
    setAnchorMenuEl(event.currentTarget);
  };

  return (
    <Grid container direction="column" justifycontent="flex-start" alignItems="stretch">
      <Grid item>
        <Tooltip title={<Typography variant="body1">Export options</Typography>}>
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

        {isEditable && (
          <Tooltip title={<Typography variant="body1">save</Typography>}>
            <Button disabled={isProcessing} onClick={handleSave} color="primary">
              <SaveOutlinedIcon color={isContentSaved ? 'primary' : 'secondary'} />
            </Button>
          </Tooltip>
        )}
      </Grid>
      {isEditable && (
        <>
          {/* TODO: Disabiling until find a way to handle timecodes and alignment on paragraph break */}
          {/* <Tooltip
        title={`To insert a paragraph break, and split a pargraph in two, put the cursor at a point where you'd want to add a paragraph break in the text and either click this button or hit enter key`}
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
                <Typography variant="body1">Put the cursor at a point where you'd want to add [INAUDIBLE] text, and click this button</Typography>
              }
            >
              <Button disabled={isProcessing} onClick={insertTextInaudible} color="primary">
                <EmojiSymbolsOutlinedIcon color="primary" />
              </Button>
            </Tooltip>

            <Tooltip title={<Typography variant="body1">Insert a ♪ in the text</Typography>}>
              <Button disabled={isProcessing} onClick={handleInsertMusicNote} color="primary">
                <MusicNoteOutlinedIcon color="primary" />
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
                <UndoOutlinedIcon color="primary" />
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
                <RedoIcon color="primary" />
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
                <ImportExportIcon color="primary" />
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
      <Grid item>{optionalBtns}</Grid>
    </Grid>
  );
}

export default SideBtns;
