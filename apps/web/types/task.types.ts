export interface TaskData {
  id: string;
  title: string;
  status: string;
  expected_result?: string;
  priority: string;
  createdAt: string;
  verifier?: string;
  assignee?: string | undefined;
  createdBy: string;
  description: any;
  start_date?: string | undefined;
  due_date?: string | undefined;
  is_repeating?: boolean;
  repeat_frequency?: string;
  reminder_time?: string;
  participants: Array<{
    initials: string;
    id: string;
    name: string;
  }>;
  activities: Activity[];
  assignee_id?: string | undefined;
  verifier_id?: string | undefined;
  project_id?: string | undefined;
  file?: any;
}

export interface Activity {
  id: string;
  type:
    | "comment"
    | "status"
    | "priority"
    | "assignment"
    | "due_date"
    | "activity"
    | "completion_report"
    | "completion_report_resolution";
  user: string;
  username: string;
  time: string;
  content?: any;
  action?: string;
  target?: string;
  replies?: Activity[];
  isResolved?: boolean;
  resolution?: "approved" | "rejected";
}

export interface ApiTaskData {
  task: {
    id: string;
    title: string;
    status: string;
    expectedResult?: string;
    priority: string;
    createdAt: string;
    description: any;
    startDate?: string;
    dueDate?: string;
    isRepeating?: boolean;
    repeatFrequency?: string;
    reminderTime?: string;
    projectId?: string;
    createdByUser: {
      id: string;
      name: string;
      email: string;
    };
    assigneeUser?: {
      id: string;
      name: string;
      email: string;
    };
    verifierUser?: {
      id: string;
      name: string;
      email: string;
    };
  };
  comment: Array<{
    id: string;
    commentContent: string;
    createdAt: string;
    type: string;
    user: {
      name: string;
      username: string;
      email: string;
    };
    children?: Array<{
      id: string;
      commentContent: string;
      createdAt: string;
      user: {
        name: string;
        username: string;
        email: string;
      };
    }>;
  }>;
  activityLog: Array<{
    id: string;
    actionType: string;
    createdAt: string;
    user: {
      name: string;
      username: string;
      email: string;
    };
    actionDetails?: {
      action: string;
      target: string;
    };
  }>;
}
