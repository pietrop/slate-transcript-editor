import { Document, Paragraph, TextRun, Packer } from 'docx';
import { shortTimecode } from '../../timecode-converter/';
import { Node } from 'slate';
export default slateToDocx;

function slateToDocx({
  value,
  speakers,
  timecodes,
  inline_speakers,
  hideTitle,
  title = 'Transcript',
  creator = 'Slate Transcript Editor',
  description = 'Transcript',
}) {
  const doc = new Document({
    creator: creator,
    description: description,
    title: title,
  });

  if (!hideTitle) {
    // Transcript Title
    // TODO: get title in programmatically - optional value
    const textTitle = new TextRun(title);
    const paragraphTitle = new Paragraph();
    paragraphTitle.addRun(textTitle);
    paragraphTitle.heading1().center();
    doc.addParagraph(paragraphTitle);

    // add spacing
    var paragraphEmpty = new Paragraph();
    doc.addParagraph(paragraphEmpty);
  }

  value.forEach((slateParagraph) => {
    // TODO: use timecode converter module to convert from seconds to timecode

    const paragraphSpeakerTimecodes = new Paragraph();
    if (timecodes) {
      const timecodeStartTime = new TextRun(shortTimecode(slateParagraph.start));
      paragraphSpeakerTimecodes.addRun(timecodeStartTime);
    }
    if (speakers) {
      if (timecodes) {
        const speaker = new TextRun(slateParagraph.speaker).bold().tab();
        paragraphSpeakerTimecodes.addRun(speaker);
      } else {
        const speaker = new TextRun(slateParagraph.speaker).bold();
        paragraphSpeakerTimecodes.addRun(speaker);
      }
    }

    const paragraphContents = Node.string(slateParagraph);
    const textBreak = new TextRun('').break();

    if (inline_speakers) {
      paragraphSpeakerTimecodes.addRun(new TextRun(`${slateParagraph.speaker.toUpperCase()}:  ${paragraphContents}`));
    }

    if (timecodes || speakers || inline_speakers) {
      doc.addParagraph(paragraphSpeakerTimecodes);
      doc.addParagraph(new Paragraph());
    }

    if (!inline_speakers) {
      const paragraphText = new Paragraph(paragraphContents);
      paragraphText.addRun(textBreak);
      doc.addParagraph(paragraphText);
    }
  });

  const packer = new Packer();

  packer.toBlob(doc).then((blob) => {
    const filename = `${title}.docx`;
    // // const type =  'application/octet-stream';
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();

    return blob;
  });
}
