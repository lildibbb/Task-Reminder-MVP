// useEditorFiles.ts
import { useState, useCallback } from "react";

export const useEditorFiles = () => {
  // Store files with their blob URLs as keys
  const [editorFiles, setEditorFiles] = useState<Map<string, File>>(new Map());

  // Add a file and get its blob URL
  const addFile = useCallback((file: File): string => {
    const blobUrl = URL.createObjectURL(file);
    setEditorFiles((prev) => {
      const newMap = new Map(prev);
      newMap.set(blobUrl, file);
      return newMap;
    });
    return blobUrl;
  }, []);

  // Get all files as an array
  const getAllFiles = useCallback((): File[] => {
    return Array.from(editorFiles.values());
  }, [editorFiles]);

  // Clear all files and revoke blob URLs to prevent memory leaks
  const clearFiles = useCallback(() => {
    editorFiles.forEach((_, url) => {
      URL.revokeObjectURL(url);
    });
    setEditorFiles(new Map());
  }, [editorFiles]);
  // Add a method to check if files are being stored
  const logFiles = useCallback(() => {
    console.log("Current editor files:", Array.from(editorFiles.entries()));
  }, [editorFiles]);
  return {
    addFile,
    getAllFiles,
    clearFiles,
    editorFiles,
    logFiles,
  };
};
