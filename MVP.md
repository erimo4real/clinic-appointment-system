# MedBook Pro - MVP Documentation

## Project Overview
**MedBook Pro** is a Clinic Appointment Management System that allows patients to book appointments with doctors, and administrators to manage the clinic's operations.

---

## Tech Stack

### Frontend
- **React 18** - UI Library
- **React Router v6** - Routing
- **Redux Toolkit** - State Management
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client with cookies

### Backend
- **Node.js/Express** - Server
- **MongoDB/Mongoose** - Database
- **JWT (jsonwebtoken)** - Authentication
- **Cookies** - Token storage (httpOnly + readable)

### Deployment
- **Frontend**: Netlify
- **Backend**: Render

---

## Authentication Strategy (JWT + Cookies)

### How it works:
1. **Login/Register** → Backend generates JWT token
2. Backend sets **TWO cookies**:
   - `auth_token` (httpOnly, secure) - For server-side validation
   - `token` (readable) - For frontend API calls
3. Backend returns token in response body
4. Frontend stores token in readable cookie
5. All API requests include `withCredentials: true` and token in Authorization header

### Cookie Settings:
```
httpOnly: false (readable by JS)
secure: true (HTTPS only)
sameSite: 'none' (cross-origin)
maxAge: 7 days
path: '/'
```

### API Request Flow:
```
Frontend → Axios (withCredentials: true)
         → Backend checks auth_token cookie
         → Backend validates JWT from Authorization header
         → Returns response
```

---

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Full access to manage users, doctors, services, appointments |
| `doctor` | Manage own schedule and appointments |
| `patient` | Book appointments, view own appointments |
| `receptionist` | Manage appointments on behalf of patients |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Users (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | Get all doctors |
| GET | `/api/doctors/:id` | Get doctor by ID |
| POST | `/api/doctors` | Create doctor (Admin) |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor |
| GET | `/api/doctors/:id/schedule` | Get doctor schedule |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |
| GET | `/api/services/:id` | Get service by ID |
| POST | `/api/services` | Create service (Admin) |
| PUT | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/my` | Get my appointments |
| GET | `/api/appointments/:id` | Get appointment by ID |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Cancel appointment |

---

## Frontend Routes

### Public Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | LandingPage | Home page |
| `/login` | LoginPage | Login form |
| `/register` | RegisterPage | Registration form |
| `/services` | ServicesPage | List of services |
| `/doctors` | DoctorsPage | List of doctors |
| `/booking` | BookingPage | Book appointment |

### Protected Routes (All Users)
| Path | Component | Description |
|------|-----------|-------------|
| `/dashboard` | Dashboard | User dashboard |
| `/profile` | PatientProfile | User profile |

### Admin Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/admin` | AdminDashboard | Admin dashboard |
| `/admin/users` | UserManagement | Manage users |
| `/admin/doctors` | DoctorManagement | Manage doctors |
| `/admin/services` | ServiceManagement | Manage services |
| `/admin/appointments` | AppointmentManagement | Manage appointments |

---

## File Structure

### Frontend MVP
```
frontend/src/
├── App.js                          # Main routes
├── index.js                        # Entry point
├── index.css                       # Global styles
├── store/
│   └── index.js                   # Redux store
├── context/
│   └── AuthContext.jsx            # Auth context
├── components/
│   └── ui/                        # UI components
│       ├── Toast.jsx
│       ├── Theme.jsx
│       └── ...
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   └── store/
│   │       └── authSlice.js
│   ├── dashboard/
│   │   └── components/
│   │       └── Dashboard.jsx
│   ├── appointments/
│   │   ├── components/
│   │   │   └── BookingPage.jsx
│   │   └── store/
│   │       └── appointmentSlice.js
│   ├── doctors/
│   │   ├── components/
│   │   │   └── DoctorsPage.jsx
│   │   └── store/
│   │       └── doctorSlice.js
│   ├── services/
│   │   └── components/
│   │       └── ServicesPage.jsx
│   ├── profile/
│   │   └── components/
│   │       └── PatientProfile.jsx
│   └── admin/
│       ├── components/
│       │   ├── AdminDashboard.jsx
│       │   ├── UserManagement.jsx
│       │   ├── DoctorManagement.jsx
│       │   ├── ServiceManagement.jsx
│       │   └── AppointmentManagement.jsx
│       └── store/
│           └── adminSlice.js
├── layout/
│   ├── Header.jsx
│   └── Footer.jsx
└── shared/
    ├── pages/
    │   ├── LandingPage.jsx
    │   └── NotFoundPage.jsx
    └── services/
        └── api.js                  # API client
```

### Backend MVP
```
backend/
├── server.js                      # Entry point
├── config/
│   └── db.js                      # MongoDB connection
├── models/
│   ├── User.js
│   ├── Doctor.js
│   ├── Service.js
│   └── Appointment.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── doctors.js
│   ├── services.js
│   └── appointments.js
├── middleware/
│   └── auth.js                    # JWT middleware
└── .env                           # Environment variables
```

---

## Data Models

### User
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  role: Enum ['admin', 'doctor', 'patient', 'receptionist'],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor
```javascript
{
  userId: ObjectId (ref: User),
  specialization: String,
  qualifications: [String],
  experience: Number,
  bio: String,
  consultationFee: Number,
  availableDays: [String],
  availableTimeStart: String,
  availableTimeEnd: String,
  rating: Number,
  isAvailable: Boolean
}
```

### Service
```javascript
{
  name: String,
  description: String,
  duration: Number (minutes),
  fee: Number,
  category: String,
  isActive: Boolean
}
```

### Appointment
```javascript
{
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: User),
  serviceId: ObjectId (ref: Service),
  date: Date,
  startTime: String,
  endTime: String,
  status: Enum ['pending', 'confirmed', 'completed', 'cancelled'],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Frontend (.env)
```
REACT_APP_API_URL=https://api.example.com
```

---

## MVP Features Checklist

### Authentication ✅
- [x] User registration
- [x] User login
- [x] User logout
- [x] Protected routes
- [x] Role-based access

### Admin Dashboard ✅
- [x] View all users
- [x] View all doctors
- [x] View all appointments
- [x] Quick actions menu
- [x] Stats overview

### User Management (Admin) ✅
- [x] List users with pagination
- [x] Create new user
- [x] Edit user
- [x] Delete user
- [x] Search/filter users

### Doctor Management (Admin) ✅
- [x] List doctors
- [x] Add new doctor
- [x] Edit doctor
- [x] Delete doctor
- [x] Search doctors

### Service Management (Admin) ✅
- [x] List services
- [x] Add new service
- [x] Edit service
- [x] Delete service

### Appointment Management (Admin) ✅
- [x] List all appointments
- [x] Filter by status
- [x] View appointment details
- [x] Update appointment status
- [x] Cancel appointment

### Patient Features ✅
- [x] View dashboard
- [x] Book appointment
- [x] View my appointments
- [x] Cancel appointment
- [x] View profile

### Public Pages ✅
- [x] Landing page
- [x] Services listing
- [x] Doctors listing

---

## Deployment Checklist

### Backend (Render)
1. Connect GitHub repo to Render
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add environment variables
5. Deploy

### Frontend (Netlify)
1. Connect GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variable: `REACT_APP_API_URL`
5. Deploy

---

## TODO - Next Steps

1. **Fix build errors** - Ensure frontend builds successfully
2. **Test authentication** - Verify login/logout works
3. **Test protected routes** - Ensure role-based access works
4. **Add error handling** - Better error messages
5. **Add loading states** - Better UX
6. **Add form validation** - Client-side validation
7. **Add notifications** - Email notifications
8. **Add file uploads** - Medical records upload

---

## Support

For issues or questions, contact the development team.
