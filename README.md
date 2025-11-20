# **Task Reminder MVP - Revnology**

## **Overview**

Internal system for Revnology

---

## **Technology Stack**

- **Backend**: Node.js (NestJS)
- **Database**: PostgreSQL (TypeORM)
- **Frontend**: React (Next.js v15.2.1), Shadcn, Tailwind CSS(v3)
- **Push Notifications**: Firebase Cloud Messaging (FCM) or Web Push API
- **Progressive Web App (PWA)**: Fully supported
- **Node.js Version**: ^v18

---

## **Monorepo Setup**

This project uses **Turborepo** to manage the monorepo structure efficiently. Both the backend and frontend are part of the same repository, allowing shared configurations and optimized builds.

---

## **Getting Started**

### **Clone the Repository**

```bash
git clone https://gitlab.revnology.com/revnology/task-reminder-system-mvp.git
```

### **Install dependencies**

In the root directory of the project:

```bash
pnpm install
```

### **Install dependencies**

Copy the .env.example file to .env:

```bash
cp .env.example .env
```

Update the .env file with your PostgreSQL connection details.

### **Running the Project**

To run both the frontend and backend with Turborepo, use the following command:

```bash
pnpm  dev
```

### **Project Structure**

task-reminder-system-mvp/
├── apps/
│ ├── backend/ # Backend code (NestJS)
│ └── frontend/ # Frontend code (Next.js)
├── packages/
│ ├── eslint-config/ # Shared ESLint configuration
│ └── shared/ # Shared components, types, and utilities
├── turbo.json # Turborepo configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
└── README.md # Project documentation
