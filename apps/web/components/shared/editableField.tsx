import { LabelTooltip } from "@/components/label/label-tooltip";
import { Button } from "../ui/button";
import type React from "react";

interface EditableFieldProps {
  label: string;
  description: string;
  isEditing: boolean;
  icon: React.ElementType;
  onEditToggle: () => void;
  displayContent: React.ReactNode;
  editContent: React.ReactNode;
}

export const EditableField = ({
  label,
  icon: Icon,
  isEditing,
  description,
  onEditToggle,
  displayContent,
  editContent,
}: EditableFieldProps) => (
  <div className="py-4 first:pt-0">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <LabelTooltip label={label} description={description} />
      </div>
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={onEditToggle}
        className="h-auto p-0 text-primary hover:text-primary/80 text-sm font-medium"
      >
        {isEditing ? "Done" : "Edit"}
      </Button>
    </div>

    {isEditing ? (
      <div className="mt-3">{editContent}</div>
    ) : (
      <div className="mt-1">{displayContent}</div>
    )}
  </div>
);
