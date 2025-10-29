@'
# Internship Portal

Modern full-stack internship management system with Instagram-style UI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB Atlas account ([Sign up](https://www.mongodb.com/cloud/atlas))
- Cloudinary account ([Sign up](https://cloudinary.com/))

### Installation

1. **Clone the repository**
git clone https://github.com/Shikhhhhh/training-project1.git
cd training-project1

text

2. **Run the installer (Windows PowerShell)**
.\install-dependencies.ps1

text

This will automatically install all dependencies for both frontend and backend.

### Manual Installation (Alternative)

If the PowerShell script doesn't work:

Install backend dependencies
cd server
npm install

Install frontend dependencies
cd ../client
npm install

text

### Environment Setup

Create `server/.env` file:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_min_32_characters
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173

text

### Run the Application

**Terminal 1 - Backend:**
cd server
npm run dev

text

**Terminal 2 - Frontend:**
cd client
npm run dev

text

### Access

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🔑 Test Credentials

- **Student:** shikhar123@gmail.com / test@123

## 📦 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Ant Design
- **Backend:** Node.js, Express, MongoDB
- **Auth:** JWT
- **Storage:** Cloudinary

## 📝 License

MIT
'@ | Out-File -FilePath README.md -Encoding UTF8 -Force

Write-Host "✓ Updated README.md" -ForegroundColor Green

📋 How Anyone Will Use It
After cloning the repo:

powershell
# 1. Clone
git clone https://github.com/Shikhhhhh/training-project1.git
cd training-project1

# 2. Run installer (ONE COMMAND!)
run this file in the powershell:

.\install-dependencies.ps1

# 3. Create .env file
# 4. Run servers

ive made it that easy for you guys now check it out !!!
