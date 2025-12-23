# Note Genie 📝

A modern, full-stack note-taking application with secure email-based authentication.

> [!NOTE]
> **For Recruiters & Testers:** 
> Since this application is deployed on a free-tier hosting service (Render), SMTP email traffic is often restricted or rate-limited, which may prevent OTP emails from arriving. 
> To ensure a smooth testing experience, this app includes a **Demo Mode**: if email sending fails or is delayed, the **OTP Code will be displayed directly on the verification screen**. Please use that code to proceed.

## Features

- ✨ **Email OTP Authentication** - Secure registration with email verification
- 🔐 **Password Reset** - Forgot password flow with OTP
- 📝 **Notes CRUD** - Create, read, update, delete notes
- 💾 **MongoDB Storage** - Cloud-based data persistence
- 🎨 **Modern UI** - Clean, dark-themed interface with Tailwind CSS

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React + Vite | Express.js |
| Redux Toolkit | MongoDB + Mongoose |
| Tailwind CSS | JWT Authentication |
| Axios | Nodemailer |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Gmail account with App Password

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/note-genie.git
   cd note-genie
   ```

2. **Install dependencies**
   ```bash
   # Server
   cd server
   npm install

   # Client
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   
   Create `server/.env`:
   ```env
   PORT=5001
   JWT_SECRET=your-super-secret-jwt-key
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/notegenie
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ```

4. **Run the application**
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev

   # Terminal 2 - Client
   cd client
   npm run dev
   ```

5. **Open** `http://localhost:5173`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user (sends OTP) |
| POST | `/auth/verify-otp` | Verify email OTP |
| POST | `/auth/login` | Login user |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with OTP |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes` | Get all notes |
| POST | `/notes` | Create new note |
| PUT | `/notes/:id` | Update note |
| DELETE | `/notes/:id` | Delete note |

## Project Structure

```
note-genie/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── reducers/       # Redux slices
│   │   └── store/          # Redux store config
│   └── index.html
│
├── server/                 # Backend (Express)
│   ├── controllers/        # Route handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── utils/              # Helper functions
│   └── index.js            # Entry point
│
└── README.md
```

## License

MIT

---

Made with ❤️ by Kartikay Shukla
