import { TranscriptData } from 'components';
import { TranscriptWord } from './slate';

declare module 'stt-align-node' {
  function alignSTT(words: TranscriptData, text: string): TranscriptWords[];
}
