import { generateHTML } from "@tiptap/html";
import { BaseKit } from "reactjs-tiptap-editor";

import { Attachment } from "reactjs-tiptap-editor/attachment";
import { Blockquote } from "reactjs-tiptap-editor/blockquote";
import { Bold } from "reactjs-tiptap-editor/bold";
import { BulletList } from "reactjs-tiptap-editor/bulletlist";
import { Clear } from "reactjs-tiptap-editor/clear";
import { Code } from "reactjs-tiptap-editor/code";
import { CodeBlock } from "reactjs-tiptap-editor/codeblock";
import { Color } from "reactjs-tiptap-editor/color";
import { ColumnActionButton } from "reactjs-tiptap-editor/multicolumn";
import { CustomVideo } from "@/components/react-tiptap/video.extension";
import { Emoji } from "reactjs-tiptap-editor/emoji";
import { ExportPdf } from "reactjs-tiptap-editor/exportpdf";
import { ExportWord } from "reactjs-tiptap-editor/exportword";
import { FontFamily } from "reactjs-tiptap-editor/fontfamily";
import { FontSize } from "reactjs-tiptap-editor/fontsize";
import { FormatPainter } from "reactjs-tiptap-editor/formatpainter";
import { Heading } from "@tiptap/extension-heading";
import { Highlight } from "reactjs-tiptap-editor/highlight";
import { History } from "reactjs-tiptap-editor/history";
import { HorizontalRule } from "reactjs-tiptap-editor/horizontalrule";
import { Iframe } from "reactjs-tiptap-editor/iframe";
import { Image } from "reactjs-tiptap-editor/image";
import { ImageGif } from "reactjs-tiptap-editor/imagegif";
import { ImportWord } from "reactjs-tiptap-editor/importword";
import { Indent } from "reactjs-tiptap-editor/indent";
import { Italic } from "reactjs-tiptap-editor/italic";
import { LineHeight } from "reactjs-tiptap-editor/lineheight";
import { Link } from "reactjs-tiptap-editor/link";
import { Mention } from "reactjs-tiptap-editor/mention";
import { MoreMark } from "reactjs-tiptap-editor/moremark";
import { OrderedList } from "reactjs-tiptap-editor/orderedlist";
import { SearchAndReplace } from "reactjs-tiptap-editor/searchandreplace";
import { SlashCommand } from "reactjs-tiptap-editor/slashcommand";
import { Strike } from "reactjs-tiptap-editor/strike";
import { Table } from "reactjs-tiptap-editor/table";
import { TableOfContents } from "reactjs-tiptap-editor/tableofcontent";
import { TaskList } from "reactjs-tiptap-editor/tasklist";
import { TextAlign } from "reactjs-tiptap-editor/textalign";
import { TextUnderline } from "reactjs-tiptap-editor/textunderline";
import { Video } from "reactjs-tiptap-editor/video";
import { TextDirection } from "reactjs-tiptap-editor/textdirection";
import { Twitter } from "reactjs-tiptap-editor/twitter";
import { Mermaid } from "reactjs-tiptap-editor/mermaid";
import { Markdown } from "tiptap-markdown";

/**
 * Converts Tiptap JSON to HTML for display
 *
 * @param json - The Tiptap JSON content to convert
 * @returns HTML string
 */
export function convertJsonToHtml(json: any): string {
  if (!json) return "";

  try {
    const jsonContent = typeof json === "string" ? JSON.parse(json) : json;

    const extensions = [
      BaseKit.configure({
        placeholder: {
          showOnlyCurrent: true,
        },
      }),

      History,
      Markdown.configure({
        transformPastedText: true,
        transformCopiedText: true,
      }),
      SearchAndReplace,
      TableOfContents,
      FormatPainter,
      Clear,
      FontFamily,
      Heading,
      FontSize,
      Bold,
      Italic,
      TextUnderline,
      Strike,
      MoreMark,
      Emoji,
      Color,
      Highlight,
      BulletList,
      OrderedList,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Indent,
      LineHeight,
      TaskList.configure({
        taskItem: {
          nested: true,
        },
      }),
      Link,
      Image,
      CustomVideo,
      ImageGif,
      Blockquote,
      SlashCommand,
      HorizontalRule,
      Code,
      CodeBlock,
      ColumnActionButton,
      Table,
      Iframe,
      ExportPdf,
      ImportWord,
      ExportWord,
      TextDirection,
      Mention,
      Attachment,
      Mermaid,
      Twitter,
    ];

    const data = generateHTML(jsonContent, extensions);

    return data;
  } catch (error) {
    return "<p>Error rendering content</p>";
  }
}
