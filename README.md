# Al-Ghadeer School Management System

A comprehensive web-based school management platform that centralizes and automates
administrative and academic operations for **administrators**, **teachers**, and **students**.

Senior Project — Lebanese International University (LIU), Spring 2025–2026.

---

## Overview

The system replaces paper-based and fragmented processes with a single responsive
platform. Each user role gets a tailored experience:

- **Admin** — manages users, classes, subjects, announcements, events, and exam schedules.
- **Teacher** — records attendance, enters grades, uploads class materials, and arranges class seats.
- **Student** — views grades, schedule, materials, assigned seat, and school announcements.

A key feature is the **Smart Seat Allocation** module, which automatically arranges
students in the classroom based on health accommodations and academic level.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Front-end | React.js (Create React App) |
| Back-end | Node.js + Express |
| Database | MySQL  |
| HTTP client | Axios |
| Styling | Bootstrap + Material UI |
| Auth | Role-based access control (role passed via request headers) |

---

## Project Structure

```
Alghadeer/
├── client/                 # React front-end
│   ├── src/
│   │   ├── pages/          # Application pages (Dashboard, Grades, Attendance, ...)
│   │   ├── context/        # AuthContext (user state)
│   │   └── services/       # api.js (Axios instance)
│   └── .env                # GENERATE_SOURCEMAP=false
│
└── server/                 # Node.js / Express back-end
    ├── config/             # database.js (MySQL connection)
    ├── middleware/         # auth.js (authenticate + authorize)
    ├── controllers/        # Business logic per feature
    ├── routes/             # API endpoints
    └── .env                # PORT + database settings
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- XAMPP / MySQL

### 1. Database setup
1. Start MySQL (e.g. via XAMPP).
2. Open **phpMyAdmin** and create a database named `school`.
3. Import the provided `school.sql` file into the `school` database.

### 2. Back-end
```bash
cd server
npm install
node index.js
```
The API runs on **http://localhost:5000**.

### 3. Front-end
```bash
cd client
npm install
npm start
```
The app runs on **http://localhost:3000**.

---

## Environment Variables

**server/.env**
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=school
CLIENT_URL=http://localhost:3000
```

**client/.env**
```
GENERATE_SOURCEMAP=false
```

---

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@alghadeer.edu | admin2026 |
| Teacher | Fatima@alghadeer.edu | fatima2026 |
| Student | student@alghadeer.edu | student2026 |

---

## Main Features

- User management (admin, teacher, student)
- Class and subject management
- Attendance recording
- Grade management per subject and semester
- Class materials (video, document, text, image)
- Smart seat allocation (AI-based seating)
- Announcements and events
- Exam scheduling
- Role-based access control

---

## Author

**Fatima Dhayni** — Lebanese International University (LIU)
