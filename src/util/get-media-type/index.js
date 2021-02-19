import path from 'path';

const getMediaType = (mediaUrl) => {
  const clipExt = path.extname(mediaUrl);
  let tmpMediaType = 'video';
  if (clipExt === '.wav' || clipExt === '.mp3' || clipExt === '.m4a' || clipExt === '.flac' || clipExt === '.aiff') {
    tmpMediaType = 'audio';
  }
  return tmpMediaType;
};

export default getMediaType;
