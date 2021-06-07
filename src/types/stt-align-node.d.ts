import { TranscriptData } from 'components/TranscriptEditor';

declare module 'stt-align-node' {
  function alignSTT(words: TranscriptData, text: string): TranscriptWords[];
}
