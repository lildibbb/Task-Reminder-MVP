module.exports = {
  apps: [
    {
      name: "backend",
      script: "pnpm",
      args: "run start:prod",
      cwd: "apps/backend/",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "500M",
    },
    {
      name: "frontend",
      script: "pnpm",
      args: "run start:prod",
      cwd: "apps/web/",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};
