const AdminAPI = {
  mail: {
    create: "/send-email",
  },
  users: {
    invite: "admin/users/invite-user",
    create: "admin/users/create-user",
    list: "admin/users/all",
    listById: "admin/users/{id}",
    update: "admin/users/update-user/{id}",
  },
  role: {
    create: "roles/create-role",
    update: "roles/update-role/{id}",
  },
};
export { AdminAPI };
