import React, { useState } from "react";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import EditorClient from "@/components/react-tiptap/editor-client";
import { LabelTooltip } from "@/components/label/label-tooltip";
import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "@/schema/taskSchema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DescriptionSectionProps {
  form: UseFormReturn<TaskFormValues>;
  handleFileUpload: (file: File) => Promise<string>;
}

// TipTap default empty document structure
const EMPTY_TIPTAP_DOCUMENT = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};

export const DescriptionSection = ({
  form,
  handleFileUpload,
}: DescriptionSectionProps) => {
  const isEditorValueEmpty = (value: any): boolean => {
    if (value == null || value === undefined) return true;

    if (typeof value === "string") {
      return value.trim() === "";
    }

    if (
      typeof value === "object" &&
      value.type === "doc" &&
      Array.isArray(value.content)
    ) {
      if (value.content.length === 0) {
        return true;
      }

      if (value.content.length === 1) {
        const firstNode = value.content[0];
        if (
          firstNode.type === "paragraph" &&
          (!firstNode.content || firstNode.content.length === 0)
        ) {
          return true;
        }
      }
      return false;
    }

    if (typeof value === "object") {
      return Object.keys(value).length === 0;
    }

    return true;
  };

  const [showExpectedResultEditor, setShowExpectedResultEditor] =
    useState<boolean>(
      () => !isEditorValueEmpty(form.getValues("expected_result")),
    );

  const onFileUpload = async (file: File) => {
    try {
      const url = await handleFileUpload(file);
      return url;
    } catch (error) {
      console.error("File upload failed:", error);
      throw error;
    }
  };

  const handleOpenExpectedResultEditor = () => {
    setShowExpectedResultEditor(true);

    const currentValue = form.getValues("expected_result");
    if (isEditorValueEmpty(currentValue)) {
      form.setValue("expected_result", EMPTY_TIPTAP_DOCUMENT, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  };

  const handleCloseExpectedResultEditor = () => {
    const currentEditorValue = form.getValues("expected_result");

    if (isEditorValueEmpty(currentEditorValue)) {
      form.setValue("expected_result", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    setShowExpectedResultEditor(false);
  };

  return (
    <>
      <div className="space-y-2">
        <LabelTooltip
          label="Description"
          className="text-base font-medium"
          description="Describe the task in detail"
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <EditorClient
                  value={field.value || EMPTY_TIPTAP_DOCUMENT}
                  onChange={field.onChange}
                  onFileUpload={onFileUpload}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <LabelTooltip
          label="Expected Result"
          className="text-base font-medium"
          description="Describe what should happen when this task is completed"
        />

        {showExpectedResultEditor ? (
          <FormField
            control={form.control}
            name="expected_result"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <EditorClient
                    value={field.value || EMPTY_TIPTAP_DOCUMENT}
                    onChange={field.onChange}
                    onFileUpload={onFileUpload}
                  />
                </FormControl>
                <FormMessage />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCloseExpectedResultEditor}
                  >
                    Cancel
                  </Button>
                </div>
              </FormItem>
            )}
          />
        ) : (
          <div
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
              "items-center cursor-pointer hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={handleOpenExpectedResultEditor}
          >
            <p className="text-muted-foreground">
              Describe the expected result...
            </p>
          </div>
        )}
      </div>
    </>
  );
};
