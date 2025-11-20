"use client";
import { useState } from "react";

// Improved version with a more type-safe approach
export type EditingFieldName =
  | "assignee"
  | "verifier"
  | "status"
  | "priority"
  | "dates"
  | "project";

export function useTaskFormEditing() {
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [editingVerifier, setEditingVerifier] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [editingProject, setEditingProject] = useState(false);

  // Helper function to close all editing states
  const closeAllEditing = () => {
    setEditingAssignee(false);
    setEditingVerifier(false);
    setEditingStatus(false);
    setEditingPriority(false);
    setEditingDates(false);
    setEditingProject(false);
  };

  // Helper to set a specific field to edit (and close others)
  const setEditingField = (field: EditingFieldName, value: boolean) => {
    if (value) {
      closeAllEditing();
    }

    switch (field) {
      case "assignee":
        setEditingAssignee(value);
        break;
      case "verifier":
        setEditingVerifier(value);
        break;
      case "status":
        setEditingStatus(value);
        break;
      case "priority":
        setEditingPriority(value);
        break;
      case "dates":
        setEditingDates(value);
        break;
      case "project":
        setEditingProject(value);
        break;
    }
  };

  return {
    editingAssignee,
    setEditingAssignee,
    editingVerifier,
    setEditingVerifier,
    editingStatus,
    setEditingStatus,
    editingPriority,
    setEditingPriority,
    editingDates,
    setEditingDates,
    editingProject,
    setEditingProject,
    closeAllEditing,
    setEditingField,
  };
}
