import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export interface TranscriptWord {
  id: number;
  start: number;
  end: number;
  text: string;
}

type CustomText = { words: TranscriptWord[]; text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: { type: 'timedText'; speaker: string; start: any; previousTimings: any; startTimecode: any; children: CustomText[] };
    Text: CustomText;
  }
}
