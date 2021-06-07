import * as R from 'ramda';
import React, { createContext, PropsWithChildren, RefObject, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BaseEditor, createEditor, Descendant } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import SlateHelpers from './slate-helpers';

interface TranscriptEditorCtx {
  handleTimedTextClick: (event: React.MouseEvent<HTMLElement>) => void;
  isEditable: boolean;
  setValue: React.Dispatch<React.SetStateAction<Descendant[]>>;
  value: Descendant[];
  editor: BaseEditor & ReactEditor & HistoryEditor;
  setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
  playbackRate: number;
  setIsContentModified: React.Dispatch<React.SetStateAction<boolean>>;
  isContentModified: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  isProcessing: boolean;
  setIsContentSaved: React.Dispatch<React.SetStateAction<boolean>>;
  isContentSaved: boolean;
  setIsPauseWhileTyping: React.Dispatch<React.SetStateAction<boolean>>;
  isPauseWhileTyping: boolean;
}

const TranscriptEditorContext = createContext<TranscriptEditorCtx | undefined>(undefined);

export function useTranscriptEditorContext(): TranscriptEditorCtx {
  const ctx = useContext(TranscriptEditorContext);
  if (!ctx) {
    throw new Error('TranscriptEditorContext not available - are you outside the provider?');
  }
  return ctx;
}

export function TranscriptEditorContextProvider({
  children,
  defaultShowSpeakers = true,
  defaultShowTimecodes = true,
  isEditable,
  handleAnalyticsEvents,
  mediaRef,
}: PropsWithChildren<{
  defaultShowSpeakers?: boolean;
  defaultShowTimecodes?: boolean;
  isEditable?: boolean;
  handleAnalyticsEvents?: (eventName: string, properties: { fn: string; [key: string]: any }) => void;
  mediaRef: RefObject<HTMLVideoElement>;
}>): JSX.Element {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>([]);
  const [showSpeakers, setShowSpeakers] = useState(defaultShowSpeakers);
  const [showTimecodes, setShowTimecodes] = useState(defaultShowTimecodes);
  const [speakerOptions, setSpeakerOptions] = useState<string[]>([]);
  const [showSpeakersCheatSheet, setShowSpeakersCheatSheet] = useState(true);
  const [saveTimer, setSaveTimer] = useState(null);
  const [isPauseWhileTyping, setIsPauseWhileTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // used isContentModified to avoid unnecessarily running alignment if the slate value content has not been modified by the user since
  // last save or alignment
  const [isContentModified, setIsContentModified] = useState(false);
  const [isContentSaved, setIsContentSaved] = useState(true);

  const handleTimeUpdated = useCallback(
    (e) => {
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
    },
    [mediaRef]
  );

  useEffect(() => {
    // Update the document title using the browser API
    if (mediaRef && mediaRef.current) {
      // setDuration(mediaRef.current.duration);
      const current = mediaRef.current;
      current.addEventListener('timeupdate', handleTimeUpdated);

      return function cleanup() {
        // removeEventListener
        current.removeEventListener('timeupdate', handleTimeUpdated);
      };
    } else {
      console.warn('Could not register handleTimeUpdated');
    }
  }, [handleTimeUpdated, mediaRef]);

  useEffect(() => {
    const getUniqueSpeakers = R.pipe(R.pluck('speaker'), R.uniq);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const uniqueSpeakers = getUniqueSpeakers(value);
    setSpeakerOptions(uniqueSpeakers);
  }, [value]);

  const handleTimedTextClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('timecode')) {
        const start = target.dataset.start;
        if (mediaRef && mediaRef.current) {
          mediaRef.current.currentTime = parseFloat(start);
          mediaRef.current.play();

          // handles if click cancel and doesn't set speaker name
          handleAnalyticsEvents?.('ste_handle_timed_text_click', {
            fn: 'handleTimedTextClick',
            clickOrigin: 'timecode',
            timeInSeconds: mediaRef.current.currentTime,
          });
        }
      } else if (target.dataset.slateString) {
        const parentNode = target.parentNode as HTMLElement;
        if (parentNode.dataset.start) {
          const { startWord } = SlateHelpers.getSelectionNodes(editor, editor.selection);
          if (mediaRef && mediaRef.current && startWord && startWord.start) {
            mediaRef.current.currentTime = parseFloat(startWord.start);
            mediaRef.current.play();

            // handles if click cancel and doesn't set speaker name
            handleAnalyticsEvents?.('ste_handle_timed_text_click', {
              fn: 'handleTimedTextClick',
              clickOrigin: 'word',
              timeInSeconds: mediaRef.current.currentTime,
            });
          } else {
            // fallback in case there's some misalignment with the words
            // use the start of paragraph instead
            const start = parseFloat(parentNode.dataset.start);
            if (mediaRef && mediaRef.current && start) {
              mediaRef.current.currentTime = start;
              mediaRef.current.play();

              // handles if click cancel and doesn't set speaker name
              handleAnalyticsEvents?.('ste_handle_timed_text_click', {
                fn: 'handleTimedTextClick',
                origin: 'paragraph-fallback',
                timeInSeconds: mediaRef.current.currentTime,
              });
            }
          }
        }
      }
    },
    [editor, handleAnalyticsEvents, mediaRef]
  );

  const ctx = useMemo(
    (): TranscriptEditorCtx => ({
      handleTimedTextClick,
      isEditable,
      setValue,
      value,
      editor,
      setPlaybackRate,
      playbackRate,
      setIsContentModified,
      isContentModified,
      setIsProcessing,
      isProcessing,
      setIsContentSaved,
      isContentSaved,
      setIsPauseWhileTyping,
      isPauseWhileTyping,
    }),
    [editor, handleTimedTextClick, isContentModified, isContentSaved, isEditable, isPauseWhileTyping, isProcessing, playbackRate, value]
  );

  return <TranscriptEditorContext.Provider value={ctx}>{children}</TranscriptEditorContext.Provider>;
}
