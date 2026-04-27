# Gym DBMS with Facial Recognition 🏋️‍♂️👁️

A polished full-stack Gym Management System combining a modern React admin dashboard, an Express.js REST API, a PostgreSQL data layer, and a Python face recognition server for biometric attendance.

---

## 🚀 Project Overview

This repository is a complete solution for gym operations:
- Manage members, trainers, payment plans, attendance, and invoices
- Enable facial recognition-based member check-ins
- Maintain secure login for administrators
- Support real-time analytics and attendance history

It integrates three major application layers:
1. **Frontend**: React + Vite + TailwindCSS
2. **Backend API**: Node.js + Express + PostgreSQL
3. **AI Face Server**: Python + Flask + OpenCV

---

## 🧱 System Architecture

### Components

- `frontend/`: React application for Gym administrators and member check-in.
- `backend/`: Express API for authentication, member management, attendance, payments, and plan management.
- `database/`: PostgreSQL schema and database initialization scripts.
- `face_server/`: Python Flask service for facial feature extraction and matching.

### Data flow

1. Member data and face encodings are stored in PostgreSQL.
2. The React frontend captures webcam images and sends them to the Python face server.
3. The face server extracts facial data and returns a match result.
4. The backend writes attendance records and payment data.
5. The frontend displays analytics, attendance history, and member management screens.

### Architecture Diagram

```
[User Browser] --> [React Frontend]
       |               |
       |               +--> [Express Backend API] --> [PostgreSQL Database]
       |                                      \
       |                                       +--> [Face Recognition Server]
       |
       +--> [Face Check-In] --> [Python Flask Face API]
```

---

## 📁 Repository Structure

```
gym-dbms/
├── backend/          # Express REST API for gym operations
├── database/         # PostgreSQL schema and initialization script
├── face_server/      # Python Flask facial recognition service
├── frontend/         # React + Vite admin dashboard and face check-in UI
├── docker-compose.yml # Local PostgreSQL container with initial schema
└── README.md         # Project overview, architecture, and setup guide
```

---

## 🛠️ Tech Stack

- Frontend: React, Vite, TailwindCSS, react-router-dom, axios, react-webcam
- Backend: Node.js, Express, PostgreSQL, bcryptjs, jsonwebtoken, multer
- Face Recognition: Python, Flask, OpenCV, Flask-Cors, numpy
- DevOps: Docker Compose for PostgreSQL initialization

---

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker (recommended for PostgreSQL)
- PostgreSQL (if not using Docker)

### 1. Start PostgreSQL with Docker

```bash
cd /Users/yatharthgupta/Desktop/DBMS/gym-dbms
docker-compose up -d
```

This boots PostgreSQL and initializes the database via `database/schema.sql`.

### 2. Start the Python face server

```bash
cd face_server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

The face recognition API should run on `http://localhost:5001`.

### 3. Start the Node.js backend

```bash
cd backend
npm install
npm run dev
```

The backend API should run on `http://localhost:5000`.

### 4. Start the React frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend should be available on `http://localhost:5173`.

---

## 🔧 Database Schema Explained

The database schema is defined in `database/schema.sql` and includes the following tables:

### `plans`
- `id`: Primary key
- `name`: Plan name (Monthly, Quarterly, Yearly)
- `duration_months`: Plan duration in months
- `price`: Cost of the plan

### `trainers`
- `id`: Primary key
- `name`, `phone`, `specialization`
- Tracks gym trainer assignments

### `members`
- `id`: Primary key
- `name`, `age`, `gender`, `phone`
- `plan_id`: FK to `plans`
- `trainer_id`: FK to `trainers`
- `join_date`, `expiry_date`
- `face_encoding`: stored facial features for biometric matching
- `status`: Active or inactive membership

### `attendance`
- `id`: Primary key
- `member_id`: FK to `members`
- `check_in_time`: timestamp of attendance
- `method`: face recognition or manual entry
- `confidence_score`: matching confidence from facial recognition

### `payments`
- `id`: Primary key
- `member_id`: FK to `members`
- `amount`, `payment_date`, `status`
- `invoice_path`: optional path for invoice storage

### `admins`
- `id`: Primary key
- `username`, `password_hash`
- Default admin created in initialization script

### Key relationships
- `members.plan_id` → `plans.id`
- `members.trainer_id` → `trainers.id`
- `attendance.member_id` → `members.id`
- `payments.member_id` → `members.id`

This schema is optimized for gym operations, supporting attendance, membership plans, trainer assignment, and secure admin sessions.

---

## ✅ What’s Included

- Fully functional admin dashboard
- Member registration and plan assignment
- Trainer records and plan maintenance
- Biometric face recognition attendance
- Payments and invoice-ready tracking
- Docker-powered PostgreSQL initialization

---

## 📌 Notes

- Keep `.env` files out of source control.
- Use the Docker setup to avoid manual PostgreSQL configuration.
- For production, replace default admin credentials and secure the API.

---

## 💡 Default Login
- Username: `admin`
- Password: `admin123`

---

## Next Steps
- Add encrypted file storage for invoices
- Improve face recognition matching thresholds
- Add member check-out and subscription renewal automation
