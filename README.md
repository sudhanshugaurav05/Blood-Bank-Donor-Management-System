# Blood Bank and Donor Management System

A complete mini-project for a **Blood Bank and Donor Management System** with donor and patient registration, JWT login, donor listing on the homepage, blood request posting, donation profile management, and help/support messages.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt password hashing

## Project Structure

```txt
blood-bank-donor-management-system/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── assets/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── styles/
    ├── .env.example
    ├── package.json
    └── index.html
```

## Setup Guide

### 1. Install required software

Install:

- Node.js 20.19+ recommended for current Vite versions
- MongoDB Community Server locally, or use MongoDB Atlas online
- VS Code

### 2. Start backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Default backend URL:

```txt
http://localhost:5000
```

### 3. Start frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Default frontend URL:

```txt
http://localhost:5173
```

### 4. Add sample data

After backend is running, open another terminal:

```bash
cd backend
npm run seed
```

Seed user password:

```txt
Password@123
```

### 5. Demo Flow

1. Register as **Donor** or **Patient**.
2. Login.
3. Go to **Donate** if donor and update donor availability.
4. Go to **Need Blood** if patient and create a request.
5. Go to **Home** to see registered donors.
6. Open **Help & Support** to submit a support message.

## Image Placement Guide

Put images inside:

```txt
frontend/src/assets/
```

Already included:

- `logo.svg` for navbar logo
- `hero-blood.svg` for home hero section
- `blood-cells.svg` for info cards

If you generate 4K images externally, save them here:

```txt
frontend/src/assets/hero-blood-4k.jpg
frontend/src/assets/donor-care-4k.jpg
frontend/src/assets/hospital-help-4k.jpg
```

Then import them in React pages like:

```js
import heroImage from '../assets/hero-blood-4k.jpg';
```

## 4K Image Prompts

Use these prompts in any image generator:

### Hero image

```txt
4K ultra HD modern healthcare illustration, blood donation camp, smiling diverse donor and patient, red and white clean medical theme, futuristic UI style, soft lighting, professional hospital background, no text, high detail
```

### Donor page image

```txt
4K ultra HD realistic healthcare scene, young blood donor sitting comfortably while donating blood, nurse assisting, clean hospital environment, warm red and white color tone, positive emotional look, no text
```

### Need blood page image

```txt
4K ultra HD hospital emergency blood support concept, doctor holding blood bag, patient care, clean medical room, red and white theme, dramatic but hopeful lighting, no text
```

## Important Backend Endpoints

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Donors

```txt
GET /api/donors
GET /api/donors/:id
PUT /api/donors/profile
```

### Blood Requests

```txt
POST /api/requests
GET  /api/requests
PUT  /api/requests/:id/close
```

### Support

```txt
POST /api/support
GET  /api/support/my-messages
```

## Notes for Mini Project Viva

You can explain the project like this:

> This Blood Bank and Donor Management System helps donors and patients communicate easily. Donors and patients first register and login securely. Donors can update their availability and blood group details. Patients can post blood requirements. The homepage displays available registered donors so patients can contact them quickly. The system uses React for frontend, Express for backend APIs, MongoDB for database, JWT for authentication, and bcrypt for password security.

## Safety Note

This is a mini-project starter. In a real production blood bank system, phone numbers and medical information should be protected with stronger privacy, role-based access, admin approval, rate limiting, audit logs, and verified medical organization workflows.
