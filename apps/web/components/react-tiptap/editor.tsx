"use client";

import { useCallback } from "react";

import RichTextEditor, { BaseKit } from "reactjs-tiptap-editor";

import {
  BubbleMenuTwitter,
  BubbleMenuMermaid,
} from "reactjs-tiptap-editor/bubble-extra";

import { Attachment } from "reactjs-tiptap-editor/attachment";
import { Blockquote } from "reactjs-tiptap-editor/blockquote";
import { Bold } from "reactjs-tiptap-editor/bold";
import { BulletList } from "reactjs-tiptap-editor/bulletlist";
import { Clear } from "reactjs-tiptap-editor/clear";
import { Code } from "reactjs-tiptap-editor/code";
import { CodeBlock } from "reactjs-tiptap-editor/codeblock";
import { Color } from "reactjs-tiptap-editor/color";
import { ColumnActionButton } from "reactjs-tiptap-editor/multicolumn";
import { Emoji } from "reactjs-tiptap-editor/emoji";
import { ExportPdf } from "reactjs-tiptap-editor/exportpdf";
import { ExportWord } from "reactjs-tiptap-editor/exportword";
import { FontFamily } from "reactjs-tiptap-editor/fontfamily";
import { FontSize } from "reactjs-tiptap-editor/fontsize";
import { FormatPainter } from "reactjs-tiptap-editor/formatpainter";
import { Heading } from "reactjs-tiptap-editor/heading";
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

// styling
import "reactjs-tiptap-editor/style.css";
// refer: https://github.com/FIameCaster/prism-code-editor
import "prism-code-editor/layout.css";
import "prism-code-editor/themes/vs-code-dark.css";
import { convertBase64ToBlob } from "@/helpers/helper";
import { Textarea } from "../ui/textarea";
import { Markdown } from "tiptap-markdown";
import { useTheme } from "next-themes";

interface EditorProps {
  value: any;
  onChange: (value: any) => void;
  onFileUpload: (file: File) => Promise<string>;
}

function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    // @ts-ignore
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function Editor({ value, onChange, onFileUpload }: EditorProps) {
  const { resolvedTheme } = useTheme();
  const handleValueChange = useCallback(
    debounce((newContent: any) => {
      onChange(newContent);
    }, 300),
    [onChange],
  );
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
    FormatPainter.configure({ spacer: true }),
    Clear,
    FontFamily,
    Heading.configure({ spacer: true }),
    FontSize,
    Bold,
    Italic,
    TextUnderline,
    Strike,
    MoreMark,
    Emoji,
    Color.configure({ spacer: true }),
    Highlight,
    BulletList,
    OrderedList,
    TextAlign.configure({ types: ["heading", "paragraph"], spacer: true }),
    Indent,
    LineHeight,
    TaskList.configure({
      spacer: true,
      taskItem: {
        nested: true,
      },
    }),
    Link,
    Image.configure({
      upload: (files: File) => {
        return onFileUpload(files);
      },
    }),
    Video.configure({
      upload: (files: File) => {
        return onFileUpload(files);
      },
    }),
    ImageGif.configure({
      GIPHY_API_KEY: process.env.NEXT_PUBLIC_GIPHY_API_KEY as string,
    }),
    Blockquote,
    SlashCommand,
    HorizontalRule,
    Code.configure({
      toolbar: false,
    }),
    CodeBlock,
    ColumnActionButton,
    Table.configure({
      HTMLAttributes: { class: "table-bordered" },
      resizable: true,
    }),
    Iframe,
    ExportPdf.configure({ spacer: true }),
    ImportWord.configure({
      upload: (files: File[]) => {
        const f = files.map((file) => ({
          src: URL.createObjectURL(file),
          alt: file.name,
        }));
        return Promise.resolve(f);
      },
    }),
    ExportWord,
    TextDirection,
    Mention,
    Attachment.configure({
      upload: (file: File) => {
        return onFileUpload(file);
      },
    }),

    // Mermaid.configure({
    //   upload: (file: any) => {
    //     // fake upload return base 64
    //     const reader = new FileReader();
    //     reader.readAsDataURL(file);
    //
    //     return new Promise((resolve) => {
    //       setTimeout(() => {
    //         const blob = convertBase64ToBlob(reader.result as string);
    //         resolve(URL.createObjectURL(blob));
    //       }, 300);
    //     });
    //   },
    // }),
    //
    // Twitter,
  ];
  return (
    <>
      <RichTextEditor
        output="json"
        content={value}
        onChangeContent={handleValueChange}
        extensions={extensions}
        dark={resolvedTheme === "dark"}
        bubbleMenu={{
          render({ extensionsNames, editor, disabled }, bubbleDefaultDom) {
            return (
              <>
                {bubbleDefaultDom}

                {/*{extensionsNames.includes("twitter") ? (*/}
                {/*  <BubbleMenuTwitter*/}
                {/*    disabled={disabled}*/}
                {/*    editor={editor}*/}
                {/*    key="twitter"*/}
                {/*  />*/}
                {/*) : null}*/}

                {/*{extensionsNames.includes("mermaid") ? (*/}
                {/*  <BubbleMenuMermaid*/}
                {/*    disabled={disabled}*/}
                {/*    editor={editor}*/}
                {/*    key="mermaid"*/}
                {/*  />*/}
                {/*) : null}*/}
              </>
            );
          },
        }}
      />

      {/* DEBUG JSON structure*/}
      {/*{(typeof value === "string" || typeof value === "object") && value && (*/}
      {/*  <Textarea*/}
      {/*    className="textarea"*/}
      {/*    readOnly*/}
      {/*    style={{*/}
      {/*      marginTop: 20,*/}
      {/*      height: 500,*/}
      {/*      width: "100%",*/}
      {/*      borderRadius: 4,*/}
      {/*      padding: 10,*/}
      {/*      fontFamily: "monospace",*/}
      {/*      fontSize: "12px",*/}
      {/*    }}*/}
      {/*    value={*/}
      {/*      typeof value === "object" ? JSON.stringify(value, null, 2) : value*/}
      {/*    }*/}
      {/*  />*/}
      {/*)}*/}
    </>
  );
}

// @ts-ignore
export default Editor;
