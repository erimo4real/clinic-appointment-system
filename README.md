# Clinic Appointment System

A full-stack medical clinic booking platform built with Node.js, Express, MongoDB, React, Redux, and Tailwind CSS.

## Features

- **User Authentication** - JWT-based auth with httpOnly cookies
- **Role-based Access** - Patient, Doctor, Admin, Receptionist
- **Appointment Booking** - Multi-step booking flow with doctor/service selection
- **Patient Feedback** - Like/dislike system with star ratings
- **Email Notifications** - Admin and doctor notified of new feedback
- **Admin Dashboard** - Full CRUD for users, doctors, services, appointments
- **Doctor Profile** - View patients, respond to feedback
- **Patient Profile** - Edit info, view appointments, give feedback
- **Responsive Design** - Professional UI with Tailwind CSS

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer for emails
- Cloudinary for file uploads

### Frontend
- React 18
- Redux Toolkit
- Tailwind CSS
- React Router v6

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd clinic-appointment-system
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other config
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL
npm start
```

### Environment Variables

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clinic_appointment
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@example.com
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── application/
│   │   │   ├── routes/        # API endpoints
│   │   │   └── services/     # Business logic
│   │   ├── domain/
│   │   │   ├── entities/    # Mongoose models
│   │   │   └── repositories/ # Data access
│   │   └── infrastructure/
│   │       ├── config/       # DB, Cloudinary config
│   │       └── middleware/   # Auth middleware
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── components/ui/     # Reusable UI components
│       ├── features/
│       │   ├── admin/        # Admin panel
│       │   ├── appointments/ # Booking & dashboards
│       │   ├── auth/         # Login, register
│       │   ├── doctors/      # Doctors page
│       │   ├── feedback/    # Feedback system
│       │   ├── profile/      # User profiles
│       │   └── services/     # Services page
│       ├── layout/           # Header, Footer
│       ├── lib/              # Utilities
│       └── shared/           # Landing page, API service
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/profile` | PUT | Update profile |
| `/api/doctors` | GET | List doctors |
| `/api/services` | GET | List services |
| `/api/appointments` | GET/POST | List/create appointments |
| `/api/feedback` | POST | Submit feedback |
| `/api/feedback/patient` | GET | Patient's feedback |
| `/api/admin/users` | GET/POST/PUT/DELETE | User management |
| `/api/admin/doctors` | GET/POST/PUT/DELETE | Doctor management |
| `/api/admin/stats` | GET | Dashboard statistics |

## User Roles

| Role | Permissions |
|------|-------------|
| `patient` | Book appointments, give feedback, view profile |
| `doctor` | View patients, respond to feedback, manage schedule |
| `receptionist` | Manage appointments |
| `admin` | Full system access, manage all data |

## Setting Admin User

To give a user admin access, run in MongoDB:
```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

## Screenshots

- Landing page with auto-sliding services/doctors
- Professional login/register pages
- Multi-step booking flow
- Role-based dashboards
- Admin panel with full CRUD

## Docker Setup

### Quick Start with Docker

1. **Copy environment file**
```bash
cp .env.docker.example .env.docker
# Edit .env.docker with your configuration
```

2. **Start all services**
```bash
# Windows
setup-docker.bat start

# Linux/Mac
./setup-docker.sh start
```

3. **Seed the database (first time only)**
```bash
# Windows
setup-docker.bat seed

# Linux/Mac
./setup-docker.sh seed
```

### Available Commands

| Command | Description |
|---------|-------------|
| `start` | Start all services (MongoDB, Backend, Frontend) |
| `stop` | Stop all services |
| `restart` | Restart all services |
| `seed` | Seed the database with sample data |
| `logs` | View service logs |
| `status` | Show service status |
| `rebuild` | Rebuild and restart services |
| `clean` | Remove all containers and volumes |

### Docker URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |
| MongoDB | mongodb://localhost:27017 |

### Test Credentials

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medbookpro.com | admin123 |
| Doctor | dr.smith@medbookpro.com | doctor123 |
| Patient | patient1@example.com | patient123 |

### Environment Variables

Create `.env.docker` from `.env.docker.example`:

```env
# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Database Seeding (set to 'true' for first run)
RUN_SEED=false

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## License

MIT License
