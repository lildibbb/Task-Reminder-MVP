export const TaskTemplate = {
  title: {
    taskAssignee: '📝 New Task Assigned!',
    taskVerifier: '🕵️‍♂️ Verifier Role Assigned!',
    taskUnassign: '🚫 Task Unassigned!',
    taskOverdue: '⚠️ Task Overdue!',

    newTask: '🆕 New Task Created',
    taskDueReminder: '⏰ Deadline Alert',
    taskStarted: '🚀 Task In Progress',
    taskPendingVerification: '🔍 Ready for Review',
    verificationReminder: '⏳ Verification Needed',
    verificationFailed: '❌ Verification Failed',
    verificationFailReminder: '🔄 Action Required',
    verificationSuccessReminder: '🎉 Verification Successful',
    taskVerified: '✅ Task Verified',
    taskClosed: '🏁 Task Completed',
  },

  content: {
    taskAssignee: (taskTitle: string) =>
      `You've been assigned a new task.\nTask: "${taskTitle}"\nLet's get started! 💪`,

    taskVerifier: (taskTitle: string) =>
      `You're now the verifier for this task.\nTask: "${taskTitle}"\nPlease review when ready. ✨`,

    taskUnassign: (taskTitle: string) =>
      `You have been unassigned from the task: "${taskTitle}".`,

    taskOverdue: (taskTitle: string, dueDate: string) =>
      `This task is overdue.\nTask: "${taskTitle}"\nDue Date: ${dueDate}\nPlease take action immediately.`,

    // 1. New task - Inform everyone
    newTask: (taskTitle: string, assignee: string) =>
      `Task: "${taskTitle}"\nAssigned to: ${assignee}\nA new journey begins! 🚀`,

    // 2. Task not started/doing and less than 1 day until due
    taskDueReminder: (taskTitle: string, timeLeft: string) =>
      `Task: "${taskTitle}"\nTime Remaining: ${timeLeft}\nThis requires your urgent attention! 🚨`,

    // 3. Task status change to doing - Inform
    taskStarted: (taskTitle: string, assignee: string) =>
      `Progress has started on this task.\nTask: "${taskTitle}"\nBy: ${assignee} 📈`,

    // 4. Task status change to pending verification - Inform
    taskPendingVerification: (taskTitle: string, verifier: string) =>
      `This task is ready for verification.\nTask: "${taskTitle}"\nVerifier: ${verifier}, please review. ✨`,

    // 5. Task stuck in pending verification
    verificationReminder: (
      taskTitle: string,
      verifier: string,
      remainingTime: string,
    ) =>
      `This task is still awaiting your review.\nTask: "${taskTitle}"\nRemaining time: ${remainingTime}\nVerifier: ${verifier}, your action is needed. 🔄`,

    // 6. Task status change to verification fail - Inform
    verificationFailed: (
      taskTitle: string,
      assignee: string,
      reason?: string,
    ) =>
      `This task requires revisions.\nTask: "${taskTitle}"\nAssignee: ${assignee}\n${
        reason ? `Reason: "${reason}"\n` : ''
      }Let's get this fixed! 🛠️`,

    // 7. Task stuck in verification fail
    verificationFailReminder: (taskTitle: string, assignee: string) =>
      `This task is still pending revision.\nTask: "${taskTitle}"\nAssignee: ${assignee}, please address the feedback. ⚡`,

    // 8. Task status change to verified
    taskVerified: (taskTitle: string, verifier: string) =>
      `This task has been successfully verified!\nTask: "${taskTitle}"\nVerified by: ${verifier}\nExcellent work! 🌟`,

    // 9. Task status close - Inform
    taskClosed: (taskTitle: string, completedBy: string) =>
      `This task has been officially closed.\nTask: "${taskTitle}"\nCompleted by: ${completedBy}\nAnother one in the books! 📚`,

    verificationSuccessReminder: (taskTitle: string) =>
      `This task has been successfully verified!\nTask: "${taskTitle}"\n Please close the task! 🎉`,
  },

  action: {
    title: 'View Task',
    action: 'view',
  },
};
