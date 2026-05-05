# Clinic Appointment System - Complete Test Guide

## System Overview

- **Frontend:** https://clinic-appointment-management-sys.netlify.app
- **Backend:** https://clinic-appointment-system-88np.onrender.com
- **Currency:** ₦ (Naira)

---

## Test Environment

### Test Accounts (Create these or use existing)

| Role | Email | Password | Notes |
|------|-------|---------|---------|-------|
| Admin | admin@medbook.com | (your password) | Full access |
| Doctor | doctor@medbook.com | (your password) | Can write prescriptions |
| Receptionist | receptionist@medbook.com | (your password) | Can manage appointments |
| Patient | patient@medbook.com | (your password) | Can book appointments |

---

## Test 1: Public Pages

### 1.1 Landing Page
**URL:** `/`

- [ ] Page loads without errors
- [ ] "Book Appointment" button navigates to `/booking`
- [ ] "View Doctors" link works
- [ ] "Sign In" button works
- [ ] Navigation menu works

### 1.2 Services Page
**URL:** `/services`

- [ ] Lists all available services
- [ ] Shows service name, description, price, duration
- [ ] Page loads without errors

### 1.3 Doctors Page
**URL:** `/doctors`

- [ ] Lists all doctors
- [ ] Shows doctor name, specialty, experience, fee
- [ ] Search/filter works

---

## Test 2: Guest Booking Flow

**URL:** `/booking`

### Step 1 - Choose Doctor
- [ ] Doctor list loads
- [ ] Can search doctors by name
- [ ] Can filter by specialty
- [ ] Selecting a doctor advances to Step 2

### Step 2 - Select Service
- [ ] Shows services for selected doctor
- [ ] Shows service name, price, duration
- [ ] Selecting a service advances to Step 3

### Step 3 - Date & Time
- [ ] Date picker works
- [ ] Cannot select past dates
- [ ] Available time slots load for selected date
- [ ] Selecting a time slot shows continue button

### Step 4 - Your Info (NEW)
- [ ] First name input required
- [ ] Last name input required
- [ ] Email input required
- [ ] Phone input required
- [ ] All fields filled shows continue button

### Step 5 - Confirm
- [ ] Shows selected doctor, service, date, time
- [ ] Shows total price
- [ ] Notes textarea works
- [ ] "Confirm Booking" button works

### After Booking
- [ ] Success message shows
- [ ] "Create Account to Save Booking" option works
- [ ] "Sign In to Existing Account" option works
- [ ] "Continue as Guest" option works
- [ ] Confirmation email sent to guest email (check inbox)

---

## Test 3: Authentication

### 3.1 Login
**URL:** `/login`

- [ ] Login form loads
- [ ] Valid credentials login successfully
- [ ] Invalid credentials show error
- [ ] Redirects to dashboard on success

### 3.2 Register
**URL:** `/register`

- [ ] Registration form loads
- [ ] Can register as new patient
- [ ] Email validation works
- [ ] Redirects to dashboard on success

### 3.3 Logout
- [ ] Logout button works
- [ ] Clears session
- [ ] Redirects to login

---

## Test 4: Dashboard

**URL:** `/dashboard`

### For All Roles
- [ ] Dashboard loads based on user role
- [ ] Sidebar shows role-appropriate menu
- [ ] User profile accessible
- [ ] Logout works

### 4.1 Admin Dashboard
**Sidebar Items:**
- [ ] Dashboard (home)
- [ ] New Appointment
- [ ] Waitlist
- [ ] Doctors
- [ ] Patients
- [ ] Staff
- [ ] Services
- [ ] Appointments
- [ ] Medical Records
- [ ] Lab Results
- [ ] Payments
- [ ] Invoices
- [ ] Reports
- [ ] Settings
- [ ] Profile

### 4.2 Doctor Dashboard
**Sidebar Items:**
- [ ] Dashboard
- [ ] Write Prescription
- [ ] My Patients
- [ ] My Schedule
- [ ] Appointments
- [ ] Profile

### 4.3 Patient Dashboard
**Sidebar Items:**
- [ ] Dashboard
- [ ] Book Appointment
- [ ] Prescriptions
- [ ] Appointments
- [ ] Profile

---

## Test 5: Appointments

### 5.1 View Appointments
- [ ] List of appointments displays
- [ ] Shows date, time, doctor, service, status
- [ ] Status badges show correctly (pending, confirmed, completed, cancelled)

### 5.2 Create Appointment (Admin/Receptionist)
- [ ] Can create appointment for patient
- [ ] Can select doctor
- [ ] Can select service
- [ ] Can select date/time
- [ ] Conflict detection works

### 5.3 Update Appointment
- [ ] Can reschedule appointment
- [ ] Can cancel appointment

---

## Test 6: Medical Records

### 6.1 View Records
- [ ] List of medical records
- [ ] Patient info displays
- [ ] Doctor info displays

### 6.2 Create Record (Doctor)
- [ ] Can create medical record
- [ ] Can add diagnosis
- [ ] Can add notes

---

## Test 7: Prescriptions

### 7.1 Write Prescription (Doctor)
- [ ] Can select patient
- [ ] Can add medications
- [ ] Can add dosage
- [ ] Can add instructions
- [ ] Save prescription works

### 7.2 View Prescriptions (Patient)
- [ ] Can view own prescriptions
- [ ] Shows medications and instructions

---

## Test 8: Payments

### 8.1 View Payments
- [ ] List of payments
- [ ] Shows amount, date, status

### 8.2 Create Payment
- [ ] Can record payment
- [ ] Payment methods work

---

## Test 9: Profile

### 9.1 Personal Info
- [ ] View profile info
- [ ] Edit profile works

### 9.2 Medical Info
- [ ] View medical info (blood type, allergies, etc.)
- [ ] Edit medical info works

### 9.3 Security
- [ ] Change password works
- [ ] Current password required
- [ ] New password works
- [ ] Success message shows

---

## Test 10: Responsive Design

- [ ] Desktop view works
- [ ] Tablet view works
- [ ] Mobile view works
- [ ] Navigation collapses on mobile

---

## Test 11: Error Handling

- [ ] 404 page shows for invalid routes
- [ ] Form validation errors show
- [ ] Network errors show friendly messages
- [ ] Loading states display correctly

---

## Test 12: Performance

- [ ] Page loads under 3 seconds
- [ ] No console errors
- [ ] Images load correctly
- [ ] API calls complete successfully

---

## Bug Reporting Template

```
Test #: _
Feature: _
URL: _
Expected: _
Actual: _
Steps to Reproduce:
1. _
2. _
3. _

Screenshot/Video: _
Browser: _
Date: _
```

---

## Sign Off

| Test Area | Tester | Date | Status |
|----------|--------|------|--------|
| Public Pages | | | |
| Guest Booking | | | |
| Authentication | | | |
| Dashboard | | | |
| Appointments | | | |
| Medical Records | | | |
| Prescriptions | | | |
| Payments | | | |
| Profile | | | |
| Responsive | | | |
| Error Handling | | | |
| Performance | | | |

**Overall Status:** _ Pass / Fail

**Notes:**
_