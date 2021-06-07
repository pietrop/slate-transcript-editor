import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { Node } from 'slate';
import { shortTimecode } from '../../timecode-converter';
export default slateToDocx;

function slateToDocx({
  value,
  speakers,
  timecodes,
  inlineTimecodes,
  hideTitle,
  title = 'Transcript',
  creator = 'Slate Transcript Editor',
  description = 'Transcript',
}) {
  const paragraphs: Paragraph[] = [];

  if (!hideTitle) {
    // Transcript Title
    paragraphs.push(
      new Paragraph({
        children: [new TextRun(title)],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({})
    );
  }

  value.forEach((slateParagraph) => {
    // TODO: use timecode converter module to convert from seconds to timecode

    const paragraphSpeakerTimecodes = new Paragraph({});

    if (timecodes) {
      const timecodeStartTime = new TextRun(shortTimecode(slateParagraph.start));
      paragraphSpeakerTimecodes.addChildElement(timecodeStartTime);
    }

    if (speakers) {
      if (timecodes) {
        const speaker = new TextRun({
          bold: true,
          text: `\t${slateParagraph.speaker}`,
        });
        paragraphSpeakerTimecodes.addChildElement(speaker);
      } else {
        const speaker = new TextRun({ text: slateParagraph.speaker, bold: true });
        paragraphSpeakerTimecodes.addChildElement(speaker);
      }
    }

    const paragraphContents = Node.string(slateParagraph);

    if (inlineTimecodes) {
      paragraphSpeakerTimecodes.addChildElement(new TextRun(`${slateParagraph.speaker.toUpperCase()}:  ${paragraphContents}`));
    }

    if (timecodes || speakers || inlineTimecodes) {
      paragraphs.push(paragraphSpeakerTimecodes, new Paragraph({}));
    }

    if (!inlineTimecodes) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(paragraphContents), new TextRun({ text: '', break: 1 })],
        })
      );
    }
  });

  const doc = new Document({
    creator: creator,
    description: description,
    title: title,
    sections: [
      {
        children: paragraphs,
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    const filename = `${title}.docx`;
    // // const type =  'application/octet-stream';
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();

    return blob;
  });
}
