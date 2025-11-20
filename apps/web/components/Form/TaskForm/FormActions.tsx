import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

export enum FormActionType {
  EDIT = "edit",
  CREATE = "create",
}

interface FormActionsProps {
  loading: boolean;
  type: FormActionType;
  onCancel: () => void;
}

export const FormActions = ({ loading, onCancel, type }: FormActionsProps) => (
  <div className="flex gap-3 pt-4 mt-8">
    <Button type="submit" className="px-6" disabled={loading}>
      {loading ? (
        <>
          <Loader className="animate-spin mr-2" />
          {type === FormActionType.EDIT ? "Saving..." : "Creating..."}
        </>
      ) : type === FormActionType.EDIT ? (
        "Save Changes"
      ) : (
        "Create Issue"
      )}
    </Button>
    <Button type="button" variant="secondary" onClick={onCancel}>
      Cancel
    </Button>
  </div>
);
