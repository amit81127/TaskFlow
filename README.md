# ⚡ TaskFlow — Premium Task Management System

TaskFlow is a high-performance, minimalist MERN stack application designed for professional productivity. It features a robust design system with **Universal Light/Dark Mode**, real-time workforce analytics, and a seamless user experience.

---

## ✨ Key Features

- **🌓 Dynamic Theming**: Instant switching between Light and Dark modes with system preference sync and persistent storage.
- **📊 Workforce Analytics**: (Admin Only) Comprehensive telemetry dashboard monitoring task completion rates and user productivity.
- **🔒 Advanced Auth**: Secure JWT-based authentication with Access/Refresh token rotation and role-based access control (RBAC).
- **📝 Intelligent Tasking**: Detailed task management with priority levels (Low to Critical), status tracking, and reactive filtering.
- **⚡ Performance First**: Zero-clutter UI built with a custom CSS design system and optimized React architecture.
- **📱 Responsive by Design**: Rock-solid stability across mobile, tablet, and desktop viewports.

---

## 🚀 Tech Stack

### Frontend
- **React 18** (Vite-powered)
- **Context API** (Auth & Theme Management)
- **Vanilla CSS** (Custom Premium Design System)
- **React Router 6**

### Backend
- **Node.js & Express**
- **MongoDB & Mongoose**
- **JWT** (Multi-token strategy)
- **Bcrypt** (Secure hashing)

---

## 🛠️ Installation & Setup

### 1. Backend Configuration
Navigate to the `/backend` directory:
```bash
npm install
# Create a .env file based on .env.example
npm run dev
```

### 2. Frontend Configuration
Navigate to the `/frontend` directory:
```bash
npm install
# Ensure the backend VITE_API_URL is configured
npm run dev
```

---

## 🎨 Design Principles

TaskFlow follows the **Premium Minimal** philosophy:
- **Clarity Over Clutter**: Every element serves a specific functional purpose.
- **Stable Navigation**: Locked-on-line navigation items for a predictable UX.
- **High Contrast**: Optimal readability regardless of the lighting environment.
- **Subtle Motion**: Fast, micro-animations (`250ms`) for a responsive tactile feel.

---

## 📂 Project Structure

```bash
taskManager/
├── backend/
│   ├── src/
│   │   ├── modules/       # Auth, Admin, Tasks, Users
│   │   ├── middleware/    # Protectors & Role restrictors
│   │   └── utils/         # JWT, Response handlers
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI (Navbar, Loader)
│   │   ├── context/       # Auth & Theme state managers
│   │   ├── pages/         # Dashboard, Tasks, Analytics
│   │   └── api/           # Centralized Axios services
└── README.md
```

---

## 📝 License
Created by the Google DeepMind Agentic Coding Team as part of a high-performance demonstration.
