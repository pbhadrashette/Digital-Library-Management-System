# Digital Library Management System

A full-stack digital library web application built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 📁 Project Structure

```
Digital Library Management System/
├── frontend/                   ← React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .gitignore
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── main.jsx
│       ├── index.css
│       ├── assets/
│       ├── context/
│       │   └── AuthContext.jsx
│       └── services/
│           └── api.js
│
├── backend/                    ← Node.js + Express backend
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # MongoDB URI configure karein
node server.js
```

Backend runs on: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

> **Note:** Frontend ka `vite.config.js` mein `/api` proxy set hai jo automatically backend `localhost:5000` pe forward karta hai.

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, React Router, Lucide Icons, Vite |
| Backend   | Node.js, Express, Mongoose          |
| Database  | MongoDB                             |
| Styling   | CSS                                 |

---

## ⚙️ Environment Variables (backend/.env)

```
MONGODB_URI=mongodb://127.0.0.1:27017/lumen_library
PORT=5000
```
