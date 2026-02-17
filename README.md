# 🚀 Smart Complaint Portal

A modern, role-based complaint tracking system designed to improve transparency, accountability, and structured workflow management within institutions.

Built as an MCA Minor Project using modern web architecture.

---

## 🌟 Overview

Smart Complaint Portal is a centralized digital platform where:

- 👤 Students can submit and track complaints
- 🏢 Departments can manage assigned complaints
- 🛠 Administrators can assign, monitor, and escalate issues

The system replaces traditional manual complaint handling with a structured, role-based workflow.

---

## 🏗 Tech Stack

### Frontend
- HTML5
- CSS3 (Dark Modern UI)
- Vanilla JavaScript (ES Modules)
- Bun (package manager)

### Backend
- FastAPI (Python)
- RESTful API architecture
- JWT Authentication
- Role-Based Access Control (RBAC)

### Database
- MySQL

---

## 👥 User Roles

### 👤 Student
- Login securely
- Submit complaints
- View complaint status
- Track resolution updates

### 🏢 Department
- Login securely
- View assigned complaints
- Update complaint status
- Add remarks

### 🛠 Administrator
- Login securely
- View all complaints
- Assign complaints to departments
- Monitor resolution workflow
- Manage escalation

---

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Protected backend routes
- Token validation on every request

Frontend role checks are used only for UI rendering.
All security enforcement happens on the backend.

---

## 🎨 UI Design Philosophy

- Dark modern SaaS-inspired interface
- Glassmorphism login pages
- Animated background glow
- Fully responsive layout
- Clean, minimal, professional design

---

## 📁 Project Structure

frontend/
│
├── index.html
├── user-login.html
├── department-login.html
├── admin-login.html
│
├── user-dashboard.html
├── department-dashboard.html
├── admin-dashboard.html
│
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── landing.js
│   └── images/
│
├── src/
│   ├── config/
│   │   └── apiConfig.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── complaintService.js
│   ├── modules/
│   │   ├── loginPage.js
│   │   ├── user.js
│   │   ├── department.js
│   │   └── admin.js
│   └── utils/
│       └── authGuard.js
│
└── README.md

---

## ⚙ Installation & Setup

### 1️⃣ Clone the Repository

git clone <your-repo-url>  
cd smart-complaint-portal  

### 2️⃣ Run Frontend (Live Server)

Open the project in VS Code:

- Right click on index.html  
- Click **Open with Live Server**

## 🧠 Architectural Principles

- Separation of concerns (UI / Services / API / Utils)  
- Modular ES-based frontend structure  
- RESTful backend design  
- Secure authentication flow  
- Role-based route protection  
- Clean layered architecture  

---

## 🚀 Future Enhancements

- Email notification system  
- Real-time updates via WebSockets  
- Complaint priority tagging  
- Admin analytics dashboard  
- Export reports (PDF/CSV)  
- Mobile-first PWA version  
- Dark/Light theme toggle  

---

## 🎯 Learning Outcomes

This project demonstrates:

- Full-stack web application design  
- REST API integration  
- JWT-based authentication implementation  
- Role-based system architecture  
- Responsive UI design  
- Real-world workflow modeling  

---

## 👨‍💻 Author

Yash  
MCA Minor Project  
Smart Complaint Portal  

---

## 📜 License

This project is developed for academic purposes only.
"""