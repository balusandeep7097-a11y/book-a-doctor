# Book A Doctor Application

The **Book A Doctor App** is a responsive full-stack MERN health platform allowing patients to browse certified doctors, book scheduling slots, and upload medical documents, while doctors manage schedules and write digital prescriptions.

---

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Vanilla CSS, Lucide Icons, React Router
- **Backend**: Node.js, Express.js, JWT, Multer
- **Database**: MongoDB (Mongoose schemas) with local connection configuration

---

## 📂 Project Structure
- `backend/`: Server boot loader, controllers, model schemas, routing, and upload folders.
- `frontend/`: Single-page app with global context sessions and dashboard states.

---

## 🚀 Getting Started

### Prerequisites
1. **Node.js** (v16+) installed.
2. **MongoDB** service active (running on localhost:27017 by default).

### Installation & Run

1. Clone or navigate to the project directory:
   ```bash
   cd C:\Users\balus\.gemini\antigravity\scratch\book-a-doctor
   ```

2. Install all dependencies across both packages concurrently:
   ```bash
   npm run install-all
   ```

3. Launch the development servers:
   ```bash
   npm run dev
   ```
   - This starts the Express backend on `http://localhost:5000`.
   - This starts the React frontend on `http://localhost:5173`.

---

## 🧪 Demo & Testing Guide

To perform full manual verification, try testing these three roles:

### 1. Patient Workspace
1. Click **Register** on the navigation bar, choose **I am a Patient**, and register.
2. Go to **Find Doctors** and book a slot with an available specialist (select date and slot).
3. Open your dashboard, view upcoming appointments, and go to **Medical Reports** to upload a PDF file and share it with your doctor.

### 2. Doctor Workspace
1. Click **Register** and choose **I am a Doctor**. Provide specialty (e.g. Cardiologist), fee, experience, and clinic address.
2. Log in as **Admin** (see below) to verify the doctor.
3. Once approved, log back into the Doctor workspace. Click **Manage Schedule** to construct availability slots.
4. View incoming patient bookings, review shared patient medical reports, click **Consult**, and write a digital prescription to complete the session.

### 3. Admin Workspace
1. Register a new user and manually set their role to `admin` in the MongoDB collection, or test with an existing account.
2. Access the dashboard to review global statistics, audit booking logs, and approve pending doctor profiles.
