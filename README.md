# ResearchPilot AI

AI-Powered Research Assistant using IBM Granite.

## 🚀 Overview

ResearchPilot AI is a professional, high-performance literature review board and document indexing cockpit. It helps academic researchers, students, and practitioners digest scientific publications quickly, extract structural SWOT metrics, and chat contextually with uploaded documents in real-time.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide icons, Motion transition layouts, and Axios services.
- **Backend**: Express.js server, unified body-parsers, global exception middleware, and Vite development middleware.
- **Database**: Local SQLite database utilizing Node.js v22's built-in `node:sqlite` core driver for native, compiled binary execution.
- **Authentication**: JWT token storage, custom authenticated request interceptors, password hashing via `bcryptjs`, and secure routes.
- **File Parsing**: Real-time PDF text extraction via buffer parsing.
- **AI Integration (Granite Prep)**: Dedicated service model ready for direct watsonx.ai REST / SDK parameter streaming.

---

## 📂 Active Folder Tree

```text
ResearchPilot-AI/
├── app/                      # Backend Core
│   ├── core/
│   │   └── auth.ts           # Password hashing & JWT middleware
│   ├── database/
│   │   └── db.ts             # SQLite Database init and query utilities
│   ├── routes/
│   │   ├── auth.ts           # /signup, /login, /me endpoints
│   │   └── papers.ts         # /papers list, details, upload, delete, and AI actions
│   └── services/
│       └── ibm.ts            # IBM Granite watsonx.ai service module
├── src/                      # Frontend Core
│   ├── assets/
│   ├── components/
│   │   └── ProtectedRoute.tsx # Navigation routing guards
│   ├── context/
│   │   └── AuthContext.tsx   # Auth context & state hooks
│   ├── layouts/
│   │   └── MainLayout.tsx    # IBM Blue main layout navigation panels
│   ├── pages/
│   │   ├── Landing.tsx       # Features overview landing page
│   │   ├── Login.tsx         # User authentication form
│   │   ├── Signup.tsx        # User registration form
│   │   ├── Dashboard.tsx     # Stat counters and recent papers board
│   │   ├── UploadPaper.tsx   # Drag-and-drop PDF uploader
│   │   ├── MyPapers.tsx      # Multi-query literature library list
│   │   ├── PaperDetails.tsx  # Document summary, chat console, and SWOT board
│   │   └── NotFound.tsx      # Standard 404 error page
│   ├── services/
│   │   └── api.ts            # Axios interceptor configurations
│   ├── types.ts              # Shared TypeScript definitions
│   ├── App.tsx               # Primary react router layout mapping
│   ├── index.css             # IBM style color definitions
│   └── main.tsx              # React mounting root
├── uploads/                  # Physical PDF storage folder (created on boot)
├── .env.example              # Credentials blueprints
├── server.ts                 # Full-stack server entry point
├── package.json              # Dependency manifests
├── tsconfig.json             # TS compilations
└── vite.config.ts            # Asset configuration
```

---

## 🔒 Environment Configurations

Declare these parameters in `.env` inside your sandbox configuration:

```env
# JWT authentication key
JWT_SECRET="YOUR_SUPER_SECRET_JWT_PASSPHRASE_CHANGE_THIS"

# IBM watsonx.ai parameters
IBM_API_KEY="YOUR_IBM_CLOUD_API_KEY"
IBM_PROJECT_ID="YOUR_WATSONX_PROJECT_ID"
IBM_MODEL_ID="ibm/granite-13b-instruct-v2"
IBM_URL="https://us-south.ml.cloud.ibm.com"
```

---

## ⚙️ Build and Run Commands

### 📦 Installation
```bash
npm install
```

### 💻 Development Mode (Runs on Port 3000)
```bash
npm run dev
```

### 🏗️ Production Build and Standalone Node boot
```bash
npm run build
npm start
```
