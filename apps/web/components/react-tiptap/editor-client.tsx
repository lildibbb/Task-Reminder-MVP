"use client";

import dynamic from "next/dynamic";
import React from "react";
import GlobalSpinner from "@/components/spinner/global-spinner";

const Editor = dynamic(() => import("@/components/react-tiptap/editor"), {
  ssr: false,
  loading: () => <GlobalSpinner variant={"dots"} />,
});

interface EditorClientProps {
  value: string | object;
  onChange: (value: string | object) => void;
  onFileUpload?: (file: File) => Promise<string>;
}

const EditorClient = ({ value, onChange, onFileUpload }: EditorClientProps) => {
  return (
    <>
      <Editor value={value} onChange={onChange} onFileUpload={onFileUpload!} />
    </>
  );
};

export default EditorClient;
