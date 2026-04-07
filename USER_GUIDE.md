# MedBook Pro - User Guide

## Overview

**MedBook Pro** is a Clinic Appointment Management System that allows patients to book appointments with doctors, and administrators to manage the clinic's operations.

---

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- An internet connection

### How to Access
1. Open your browser
2. Go to: `https://clinic-appointment-management-sys.netlify.app`
3. Or run locally using Docker or npm

---

## User Roles

| Role | Description |
|------|-------------|
| **Patient** | Book appointments, view appointments, manage profile |
| **Admin** | Full access to manage users, doctors, services, appointments |
| **Doctor** | View schedule, manage appointments (future feature) |
| **Receptionist** | Manage appointments for patients (future feature) |

---

## For Patients

### 1. Create an Account

1. Go to the homepage
2. Click **"Sign Up"** or **"Get Started"**
3. Fill in the registration form:
   - Username
   - Email address
   - Password (min 6 characters)
   - First Name
   - Last Name
4. Click **"Create Account"**
5. You will be logged in automatically

### 2. Login

1. Go to the login page
2. Enter your **email** and **password**
3. Click **"Sign In"**
4. You will be redirected to your dashboard

### 3. Book an Appointment

1. After logging in, click **"Book Appointment"** from your dashboard
   - Or click **"Book Appointment"** from the home page
2. Select a **Doctor** from the list
3. Choose a **Service** (e.g., General Consultation)
4. Pick an available **Date** and **Time Slot**
5. Add any **Notes** (optional)
6. Click **"Confirm Booking"**
7. You will see a confirmation message

### 4. View My Appointments

1. Go to your **Dashboard**
2. Scroll down to **"My Appointments"** section
3. You will see all your appointments with status:
   - **Pending** - Waiting for confirmation
   - **Confirmed** - Appointment is confirmed
   - **Completed** - Appointment has been fulfilled
   - **Cancelled** - Appointment was cancelled

### 5. Cancel an Appointment

1. Go to **"My Appointments"** on your dashboard
2. Find the appointment you want to cancel
3. Click the **"Cancel"** button
4. Confirm the cancellation

### 6. Browse Doctors

1. Click **"Find Doctors"** from your dashboard
   - Or go to **"/doctors"** page
2. View doctor profiles including:
   - Specialization
   - Qualifications
   - Consultation fees
3. Click on a doctor to see full profile

### 7. View Services

1. Go to **"Services"** from the navigation
2. Browse all available medical services
3. See pricing and descriptions

### 8. Update Profile

1. Click **"My Profile"** from your dashboard
2. Update your information:
   - First Name
   - Last Name
   - Phone Number
3. Click **"Save Changes"**

---

## For Administrators

### 1. Access Admin Dashboard

1. Log in with an admin account
   - Default: `admin@medbookpro.com` / `admin123`
2. You will be redirected to `/admin`

### 2. Manage Users

1. Click **"Manage Users"** from the dashboard
2. View all registered users
3. Actions available:
   - **Add User** - Create a new user account
   - **Edit User** - Update user details
   - **Delete User** - Remove a user
   - **Search** - Find users by name or email
   - **Filter** - Filter by role

### 3. Manage Doctors

1. Click **"Manage Doctors"** from the dashboard
2. View all doctor profiles
3. Actions available:
   - **Add Doctor** - Create a new doctor profile
   - **Edit Doctor** - Update specialization, fees, schedule
   - **Delete Doctor** - Remove a doctor
   - **Search** - Find doctors by name or specialty

### 4. Manage Services

1. Click **"Services"** from the dashboard
2. View all clinic services
3. Actions available:
   - **Add Service** - Create a new service
   - **Edit Service** - Update name, description, price, duration
   - **Delete Service** - Remove a service

### 5. Manage Appointments

1. Click **"Appointments"** from the dashboard
2. View all appointments across the system
3. Filter by:
   - Status (Pending, Confirmed, Completed, Cancelled)
   - Date range
   - Doctor
   - Patient
4. Actions available:
   - **View Details** - See full appointment info
   - **Confirm** - Approve a pending appointment
   - **Complete** - Mark as completed
   - **Cancel** - Cancel an appointment

---

## Features Overview

### Dashboard Widgets

| Widget | Description |
|--------|-------------|
| **Stats Cards** | Quick overview of key metrics |
| **Quick Actions** | Shortcuts to common tasks |
| **Recent Appointments** | Latest appointment activity |
| **Charts** | Visual representation of data (Admin) |

### Search & Filters

- **Global Search** - Find doctors, services, appointments
- **Filters** - Narrow down results by status, date, category
- **Pagination** - Browse through large datasets

---

## Troubleshooting

### Can't Login?
- Check your email and password
- Ensure Caps Lock is off
- Clear browser cache and cookies
- Try resetting your password

### Appointment Not Booked?
- Check if the time slot is still available
- Ensure all required fields are filled
- Try refreshing the page

### Page Not Loading?
- Check your internet connection
- Try clearing browser cache
- Use a different browser

### Cookies Issue?
- Enable cookies in your browser settings
- Clear existing cookies for the site
- Ensure third-party cookies are allowed

---

## Security Tips

1. **Use a strong password** - Include letters, numbers, and symbols
2. **Don't share credentials** - Keep your login details private
3. **Logout after use** - Especially on shared computers
4. **Report issues** - Contact admin if you notice suspicious activity

---

## Contact & Support

For technical issues or questions:
- Email: support@medbookpro.com
- GitHub Issues: Report bugs on the project repository

---

## Appendix: Default Login Credentials

### Admin Account
- **Email:** `admin@medbookpro.com`
- **Password:** `admin123`

### Seed Data
The system comes with seed data including:
- Sample services (General Consultation, Cardiac Checkup, etc.)
- Sample doctors (after admin creates them)
- Sample appointments (if any exist)

---

## Appendix: API Endpoints (For Developers)

### Authentication
```
POST /api/auth/register - Create account
POST /api/auth/login    - Login
POST /api/auth/logout   - Logout
GET  /api/auth/me       - Get current user
```

### Appointments
```
GET    /api/appointments     - Get all appointments
GET    /api/appointments/my - Get my appointments
POST   /api/appointments     - Create appointment
PUT    /api/appointments/:id - Update appointment
DELETE /api/appointments/:id - Cancel appointment
```

### Doctors
```
GET  /api/doctors - Get all doctors
GET  /api/doctors/:id - Get doctor details
```

### Services
```
GET /api/services - Get all services
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Current | Initial MVP release |

---

*MedBook Pro - Making Healthcare Accessible*
