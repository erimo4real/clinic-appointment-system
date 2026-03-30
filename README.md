# MedBook Pro - Clinic Appointment System

A full-stack medical clinic booking platform built with Node.js, Express, MongoDB, React, Redux, and Tailwind CSS.

## 🌐 Live Demo

- **Frontend:** https://clinic-appointment-management-sys.netlify.app
- **Backend API:** https://clinic-appointment-system-88np.onrender.com

## ✨ Features

### Core Features
- **User Authentication** - JWT-based auth with httpOnly cookies
- **Role-based Access** - Patient, Doctor, Admin, Receptionist
- **Appointment Booking** - Multi-step booking flow with doctor/service selection
- **Patient Feedback** - Like/dislike system with star ratings
- **Admin Dashboard** - Full CRUD for users, doctors, services, appointments

### Additional Features
- **Medical Records** - Track patient history and diagnoses
- **Prescriptions** - Digital prescriptions from doctors
- **Search** - Search doctors and services
- **Notifications** - Real-time notifications for appointments
- **Doctor Profile** - View patients, manage schedule
- **Patient Profile** - Edit info, view appointments, give feedback

### Professional UI
- Clean, modern teal/medical color scheme
- Responsive design for all devices
- Smooth animations and transitions
- Professional form components

## 🛠 Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- RESTful API

### Frontend
- React 18
- Redux Toolkit
- Tailwind CSS
- React Router v6

## 🚀 Quick Start

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medbookpro.com | admin123 |
| Doctor | dr.smith@medbookpro.com | doctor123 |
| Receptionist | staff@medbookpro.com | staff123 |
| Patient | patient1@example.com | patient123 |

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/erimo4real/clinic-appointment-system.git
cd clinic-appointment-system
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### Docker Setup

```bash
docker compose up -d
```

## 📡 API Endpoints

| Feature | Endpoint | Methods |
|---------|----------|---------|
| Authentication | `/api/auth/*` | POST, GET, PUT |
| Doctors | `/api/doctors/*` | GET, POST, PUT, DELETE |
| Services | `/api/services/*` | GET, POST, PUT, DELETE |
| Appointments | `/api/appointments/*` | GET, POST, PUT, DELETE |
| Admin | `/api/admin/*` | GET, POST, PUT, DELETE |
| Feedback | `/api/feedback/*` | GET, POST |
| Medical Records | `/api/medical-records/*` | GET, POST, PUT, DELETE |
| Prescriptions | `/api/prescriptions/*` | GET, POST, PUT, DELETE |
| Search | `/api/search` | GET |
| Notifications | `/api/notifications/*` | GET, PUT, DELETE |

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| `patient` | Book appointments, give feedback, view profile |
| `doctor` | View patients, manage prescriptions, respond to feedback |
| `receptionist` | Manage appointments |
| `admin` | Full system access, manage all data |

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── application/
│   │   │   ├── routes/        # API endpoints
│   │   │   └── services/      # Business logic
│   │   ├── domain/
│   │   │   ├── entities/     # Mongoose models
│   │   │   └── repositories/  # Data access
│   │   └── infrastructure/
│   │       ├── config/       # DB config
│   │       └── middleware/   # Auth middleware
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── components/ui/    # Reusable UI components
│       ├── features/
│       │   ├── admin/         # Admin panel
│       │   ├── appointments/  # Booking
│       │   ├── auth/          # Login, register
│       │   ├── doctors/       # Doctors page
│       │   ├── feedback/      # Feedback system
│       │   ├── profile/       # User profiles
│       │   └── services/      # Services page
│       └── layout/            # Header, Footer
```

## 💰 Pricing (Nigerian Naira)

| Service | Price |
|---------|-------|
| General Consultation | ₦8,000 |
| Cardiac Checkup | ₦25,000 |
| Pediatric Checkup | ₦10,000 |
| Dermatology | ₦12,000 |
| Orthopedics | ₦20,000 |
| Neurology | ₦18,000 |
| Eye Examination | ₦10,000 |
| Mental Health | ₦17,000 |

## 🔧 Environment Variables

### Backend
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clinic_appointment
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
```

### Frontend
```
REACT_APP_API_URL=http://localhost:5000
```

## 📝 License

MIT License
