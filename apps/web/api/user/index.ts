const UserAPI = {
  project: {
    list: "/projects",
    create: "/projects/create-project",
  },
  task: {
    list: "/tasks",
    listByUserId: "/tasks/{userId}",
    create: "/tasks/create-task",
    update: "/tasks/{taskId}/update-task",
  },
  comment: {
    create: "/comments/{taskId}/create-comment",
  },
  activityLog: {
    list: "/activity-logs/{taskId}/get-activity-logs",
    listByUserId: "/activity-logs/{userId}",
  },
  subscription: {
    createOrUpdate: "/subscriptions/{id}/subscribe",
    update: "/subscriptions/{id}/update-subscription",
    delete: "/subscriptions/{id}/delete-subscription",
  },
};

export { UserAPI };
