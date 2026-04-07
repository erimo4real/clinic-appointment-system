# MedBook Pro - Product Requirements Document (PRD)

## 1. Project Overview

**Project Name:** MedBook Pro - Clinic Appointment System  
**Type:** Full-stack Healthcare Management Platform  
**Target Users:** Patients, Doctors, Clinic Administrators, Receptionists  
**Currency:** Nigerian Naira (₦)

---

## 2. System Architecture

### Frontend
- **URL:** https://clinic-appointment-management-sys.netlify.app
- **Framework:** React 18 + Redux Toolkit + Tailwind CSS
- **Routing:** React Router v6

### Backend
- **URL:** https://clinic-appointment-system-88np.onrender.com
- **Framework:** Node.js + Express + MongoDB
- **Auth:** JWT with httpOnly cookies

---

## 3. User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Patient** | Book appointments, view medical history, give feedback, view prescriptions |
| **Doctor** | View patients, manage schedule, write prescriptions, respond to feedback |
| **Receptionist** | Manage appointments, view patients |
| **Admin** | Full system access - CRUD on all entities |

---

## 4. Core Features

### 4.1 Authentication System ✅
- [x] JWT-based authentication
- [x] httpOnly cookies for security
- [x] Role-based access control
- [x] Persistent login (survives page refresh)
- [x] Logout clears all cookies
- [x] Login redirect based on role

### 4.2 Public Pages ✅
- [x] Landing Page - Clinic overview
- [x] Services Page - List of medical services with pricing
- [x] Doctors Page - List of doctors with ratings & favorites
- [x] Doctor Profile Page - Detailed doctor view (bio, reviews, schedule)
- [x] About Page - Clinic information

### 4.3 Patient Features ✅
- [x] Book Appointment (4-step wizard)
- [x] View Upcoming Appointments
- [x] View Past Appointments
- [x] Search Appointment History
- [x] **Reschedule Appointment**
- [x] **Cancel Appointment**
- [x] **Print Appointment** (receipt format)
- [x] Give Feedback/Rating to doctors
- [x] View Medical History
- [x] Add Medical Records
- [x] Upload Documents to medical records
- [x] View Prescriptions
- [x] **Favorite Doctors**

### 4.4 Doctor Features ✅
- [x] Doctor Profile Page
- [x] View Assigned Patients
- [x] Manage Schedule
- [x] Write Prescriptions
- [x] Respond to Feedback

### 4.5 Admin Features ✅
- [x] **Admin Dashboard**
  - Stats cards (users, doctors, appointments, revenue)
  - 6 Charts (Pie, Bar, Line, Area)
  - Recent appointments
- [x] **User Management**
  - CRUD operations
  - Pagination
  - Search & filters (role, status)
- [x] **Doctor Management**
  - CRUD operations
  - Pagination
  - Search & filters
- [x] **Service Management**
  - CRUD operations
  - Pagination
- [x] **Appointment Management**
  - CRUD operations
  - Pagination
  - Filters (status, date range)
  - **Bulk Actions** (select multiple, change status/delete)
- [x] **Calendar View**
  - Monthly calendar display
- [x] **Doctor Schedule Management**
- [x] **Waiting Room**
- [x] **Reports Page**
  - CSV export functionality
- [x] **Activity Log**
- [x] **Settings Page**

### 4.6 Email Notifications ✅
- [x] Welcome Email (on registration)
- [x] Appointment Confirmation Email
- [x] Appointment Cancellation Email

---

## 5. UI/UX Features

### 5.1 Loading States ✅
- [x] Skeleton loaders for tables
- [x] Loading spinners
- [x] Loading text states

### 5.2 Notifications ✅
- [x] Toast notifications for CRUD operations
- [x] Confirmation modals for delete actions
- [x] Empty states with helpful messages

### 5.3 Responsiveness ✅
- [x] Mobile-friendly sidebar
- [x] Responsive tables
- [x] Mobile menu toggle

### 5.4 Theme ✅
- [x] Light mode
- [x] Dark mode toggle

---

## 6. Backend Services (Ready but need API keys)

| Service | Status | Credentials Needed |
|---------|--------|-------------------|
| Email (Gmail) | ✅ Code Ready | EMAIL_USER, EMAIL_PASS |
| Cloudinary | ✅ Code Ready | CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET |
| Twilio SMS | ⏸️ Skipped | - |
| Paystack | ⏸️ Skipped | - |

---

## 7. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| POST | /api/auth/logout | Logout |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/doctors | List all doctors |
| GET | /api/doctors/:id | Get doctor details |
| POST | /api/doctors | Create doctor (admin) |
| PUT | /api/doctors/:id | Update doctor (admin) |
| DELETE | /api/doctors/:id | Delete doctor (admin) |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/services | List all services |
| GET | /api/services/:id | Get service details |
| POST | /api/services | Create service (admin) |
| PUT | /api/services/:id | Update service (admin) |
| DELETE | /api/services/:id | Delete service (admin) |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/appointments | List user appointments |
| POST | /api/appointments | Create appointment |
| PUT | /api/appointments/:id | Update appointment |
| DELETE | /api/appointments/:id | Cancel appointment |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/feedback | List all feedback |
| POST | /api/feedback | Submit feedback |
| GET | /api/feedback/patient | Get patient feedback |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/stats | Dashboard statistics |
| GET | /api/admin/users | List all users |
| POST | /api/admin/users | Create user |
| PUT | /api/admin/users/:id | Update user |
| DELETE | /api/admin/users/:id | Delete user |
| GET | /api/admin/doctors | List all doctors |
| GET | /api/admin/appointments | List all appointments |
| GET | /api/admin/services | List all services |

---

## 8. Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medbookpro.com | admin123 |
| Doctor | dr.smith@medbookpro.com | doctor123 |
| Receptionist | staff@medbookpro.com | staff123 |
| Patient | patient1@example.com | patient123 |

---

## 9. Pages & Routes

### Public Routes
| Route | Page |
|-------|------|
| / | Landing Page |
| /services | Services Page |
| /doctors | Doctors Page |
| /doctors/:id | Doctor Profile Page |
| /about | About Page |
| /login | Login Page |
| /register | Register Page |
| /forgot-password | Forgot Password |
| /booking | Booking Wizard |

### Protected Routes
| Route | Page | Access |
|-------|------|--------|
| /dashboard | Patient Dashboard | Patient |
| /profile | User Profile | All Users |
| /profile/settings | Profile Settings | All Users |
| /admin | Admin Dashboard | Admin |
| /admin/users | User Management | Admin |
| /admin/doctors | Doctor Management | Admin |
| /admin/doctor-schedule | Doctor Schedules | Admin |
| /admin/appointments | Appointment Management | Admin |
| /admin/calendar | Calendar View | Admin |
| /admin/services | Service Management | Admin |
| /admin/receptionist | Receptionist Dashboard | Admin, Receptionist |
| /admin/waiting-room | Waiting Room | Admin |
| /admin/reports | Reports & Export | Admin |
| /admin/activity | Activity Log | Admin |
| /admin/settings | Settings | Admin |

---

## 10. Pricing (Nigerian Naira)

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

---

## 11. Future Enhancements (Not Implemented)

| Feature | Priority | Notes |
|---------|----------|-------|
| WhatsApp Reminders | Medium | Integration needed |
| Online Payment (Paystack) | High | API key needed |
| SMS Notifications (Twilio) | Medium | API key needed |
| Social Login (Google/Facebook) | Medium | OAuth setup needed |
| PWA Support | Medium | Service worker needed |
| Real-time Notifications | High | Socket.io needed |
| Appointment Reminders (cron) | Medium | Background job needed |

---

## 12. Deployment Status

| Component | Platform | Status |
|-----------|----------|--------|
| Frontend | Netlify | ✅ Deployed |
| Backend | Render | ✅ Deployed |
| Database | MongoDB Atlas | ✅ Connected |

---

## 13. Known Issues / TODOs

1. [ ] Admin pages not showing data - API connection issue
2. [ ] Render needs manual redeploy for latest changes
3. [ ] Email credentials need to be set in Render dashboard
4. [ ] Cloudinary credentials need real values

---

## 14. Project Statistics

- **Total Commits:** 20+
- **Files Changed:** 30+
- **Lines Added:** 5,000+
- **Features Completed:** 50+
- **Pages:** 20+

---

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Team:** MedBook Pro Development Team
