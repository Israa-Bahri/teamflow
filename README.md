# TeamFlow

A full-stack personal project and task manager. Create an account, organise your work into projects, break each project into tasks, and move tasks across a Kanban board by dragging them between columns. A dashboard shows your progress at a glance.

Built as a portfolio project to practise the full web stack: React, Express, PostgreSQL and JWT authentication, with a hand-built interface (no UI component library).

Each account is private: you only ever see your own projects and tasks. The structure is ready to grow into team sharing (see "Ideas for next steps").

## Screenshots

**Login**

![Login](screenshots/login.png)

**Dashboard**

![Dashboard](screenshots/dashboard.png)

**Projects**

![Projects](screenshots/projects.png)

**Kanban board**

![Kanban board](screenshots/kanban.png)

## Features

- Register and log in with email and password, with JWT authentication
- Private pages and API routes that reject anonymous requests
- Projects shown as cards, created and edited in pop-up forms, with a confirmation before deleting
- Tasks with a title, description, priority and due date (overdue dates are highlighted) , you can also edit it.
- Kanban board with three columns: drag a card to another column and it moves instantly, with an automatic undo if the server fails. A menu on each card does the same on touch screens and with the keyboard.
- Dashboard with project, task and completion statistics, animated counters and a progress bar
- Toast notifications, plus loading, error and empty states on every page
- Responsive layout for phones and desktops
- Accessibility touches: keyboard-friendly custom dropdowns, visible focus outlines, and animations that switch off for people who prefer reduced motion

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL with Prisma |
| Auth | JSON Web Tokens (jsonwebtoken), password hashing with bcryptjs |

## How it works

```
Browser (React)  --HTTP/JSON-->  Express API  --Prisma-->  PostgreSQL
   port 5173                      port 5000
```

- The React app talks to the API through a shared Axios client, which attaches the login token to every request.
- Every private API route runs an auth middleware that verifies the token and sets the current user.
- Ownership is always checked on the server: users can only read, change or delete their own projects and tasks.
- Data model: a User has many Projects, and a Project has many Tasks. Deleting a project deletes its tasks.
- The interface is built from small reusable components: a modal, a custom select, a toast system, form fields and status messages.

## Security

- Passwords are hashed with bcrypt and never stored or returned in plain text
- Login errors are the same for a wrong email and a wrong password
- All input is validated on the server: types, lengths, allowed statuses and priorities, ids and dates
- Secrets live in environment variables, and `.env` files are not committed
- CORS only allows the configured frontend address

## API overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and receive a token |
| GET | `/api/auth/me` | Current user (private) |
| GET | `/api/projects` | List my projects |
| POST | `/api/projects` | Create a project |
| PATCH | `/api/projects/:id` | Edit a project |
| DELETE | `/api/projects/:id` | Delete a project and its tasks |
| GET | `/api/projects/:id/tasks` | List a project's tasks |
| POST | `/api/projects/:id/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Edit a task or change its status |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/health` | Health check |

All routes except register, login and health require an `Authorization: Bearer <token>` header.

## Run it locally

You need Node.js (LTS), Git, and a PostgreSQL database. 
(A free hosted one such as [Neon](https://neon.tech) works well.)

**1. Clone the project**

```bash
git clone https://github.com/Israa-Bahri/teamflow.git
cd teamflow
```

**2. Set up the backend**

```bash
cd server
npm install
```

Create a `.env` file from the template (`copy .env.example .env` on Windows, `cp .env.example .env` on Mac and Linux) and fill in your values:

```
PORT=5000
DATABASE_URL="your PostgreSQL connection string"
JWT_SECRET="a long random string"
CLIENT_URL="http://localhost:5173"
```

You can generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Create the database tables and start the API:

```bash
npx prisma migrate deploy
npm run dev
```

**3. Set up the frontend** (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173, register an account, and you're in.

## Tests

The backend has script-based API tests in `server/tests`. With the API running, run any of them from the `server` folder:

```bash
node tests/testValidation.js
node tests/testAuthErrors.js
node tests/testIsolation.js
node tests/testTasks.js
node tests/testTaskUpdate.js
node tests/testStats.js
node tests/testJourney.js
```

Each prints `PASS` or `FAIL` for every check. They cover input validation, authentication errors, ownership isolation between users, task and project CRUD, statistics, and a full register-to-logout user journey.

## Ideas for next steps

- Share a project with teammates (a project-members table, invite by email, task assignees)
- Live updates when someone else changes a task
- Notifications and due-date reminders
- Search and filters on the board
- Deploy the app online

## Project structure

```
teamflow/
  client/              React app
    src/api/           Axios client
    src/components/    Layout, sidebar, modal, custom select, forms, cards, route guard
    src/context/       Auth state and toast notifications
    src/pages/         Dashboard, Projects, Kanban, Login, Register
  server/              Express API
    routes/            auth, projects, tasks, stats
    middleware/        JWT auth check
    prisma/            Schema and migrations
    tests/             API test scripts
```