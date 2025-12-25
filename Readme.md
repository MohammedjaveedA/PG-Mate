# 🏠 PGMate – PG/Hostel Management System

<div align="center">

A full-stack web application for managing PG/Hostels and handling student complaints/issues efficiently.  
Separate interfaces for **Students** and **Owners** with real-time issue tracking.

**Your digital PG companion — Simplifying hostel life, one issue at a time.**

</div>

---

## ✨ Features

### 👨‍🎓 Student Features
- ✅ **User Registration & Authentication** – Secure signup/login using JWT  
- ✅ **Browse & Select PGs** – View available PG/Hostels with full details  
- ✅ **Report Issues** – Submit maintenance issues with room number, category, and priority  
- ✅ **Track Issues** – Real-time status updates *(Pending → In Progress → Resolved)*  
- ✅ **View History** – Access all reported issues with owner comments  
- ✅ **PG Management** – Leave current PG and select a new one  

### 👨‍💼 Owner Features
- ✅ **PG Registration** – Add and manage multiple PG/Hostels  
- ✅ **Dashboard** – View all PGs with active issue counts  
- ✅ **Issue Management** – Update issue status and add responses  
- ✅ **Real-time Tracking** – Monitor unresolved issues  
- ✅ **Communication** – Respond to students through comments  
- ✅ **PG Management** – Edit or delete PG listings  

---

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose ODM**
- **JWT Authentication**
- **bcryptjs** for password hashing
- **CORS** enabled

### Frontend
- **React** with **Vite**
- **React Router DOM v7**
- **Tailwind CSS v4**
- **Axios** for API communication

---

## 📦 Installation & Setup

### Prerequisites
- Node.js **v18 or higher**
- MongoDB *(Local or MongoDB Atlas)*
- npm or yarn

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/MohammedjaveedA/PG-Mate.git
cd PG-Mate

```


⚠️ Before setting up the backend, make sure MongoDB Compass is running and connected to:
mongodb://localhost:27017


2️⃣ Backend Setup

```bash
cd backend
```


Install dependencies:
```bash
npm install
```

Create .env file:
```bash
MONGO_URI=mongodb://localhost:27017/PG-Mate
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
```

Start backend server:
```bash
npm run dev
```

3️⃣ Frontend Setup
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start frontend server:
```bash
npm run dev
```
4️⃣ Access the Application

Backend API: http://localhost:5000
Frontend: http://localhost:5173

📂 Project Structure
```bash
PG-Mate/
├── backend/
│   ├── models/
│   │   ├── user.js          # User schema
│   │   ├── issue.js         # Issue schema (with roomNumber)
│   │   └── PGHostel.js      # PG/Hostel schema
│   ├── routes/
│   │   ├── auth.js          # Auth endpoints
│   │   ├── issues.js        # Issue endpoints
│   │   ├── pghostel.js      # PG endpoints
│   │   └── student.js       # Student endpoints
│   ├── middleware/
│   │   └── auth.js          # JWT auth middleware
│   ├── server.js            # Main server file
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── student/
    │   │   │   ├── Dashboard.jsx      # Student dashboard
    │   │   │   ├── CreateIssue.jsx    # Issue reporting (with room number)
    │   │   │   └── MyIssues.jsx       # Student's issues
    │   │   ├── owner/
    │   │   │   ├── Dashboard.jsx      # Owner dashboard
    │   │   │   └── Issues.jsx         # Issue management
    │   │   ├── LoginPage.jsx          # Login page
    │   │   ├── RegisterPage.jsx       # Registration
    │   │   └── RoleSelectionPage.jsx  # Role selection
    │   ├── services/
    │   │   ├── auth.js      # Auth service
    │   │   ├── api.js       # API configuration
    │   │   └── issues.js    # Issue service
    │   ├── App.jsx          # Main app with routes
    │   └── main.jsx         # Entry point
    └── package.json
```

👨‍💻 Author

Mohammed Javeed
📌 Computer Science Engineering (AI & ML)
📌 RNS Institute of Technology, Bangalore