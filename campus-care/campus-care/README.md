# 🌿 Campus Care — Full Stack Mental Health Platform

A full-stack student mental health support system built with React + Node.js + MongoDB.

---

## Project Structure

```
campus-care/
├── backend/          ← Node.js + Express API (deploy to Render)
│   ├── src/
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── package.json
│   ├── render.yaml
│   └── .env.example
│
└── frontend/         ← React app (deploy to Vercel)
    ├── src/
    │   ├── App.js
    │   ├── pages/
    │   ├── components/
    │   ├── services/api.js    ← All API calls
    │   └── context/AuthContext.js
    ├── public/
    ├── package.json
    └── vercel.json
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + React Router v6 |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| AI Chatbot | Anthropic Claude API |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## Step 1 — Set Up MongoDB Atlas

1. Go to https://cloud.mongodb.com and create a free account
2. Create a new **free M0 cluster** (choose Singapore region)
3. In **Database Access** → Add user with username/password → note these down
4. In **Network Access** → Add IP: `0.0.0.0/0` (allow all — required for Render)
5. Click **Connect** → **Connect your application** → copy the connection string
6. Replace `<username>` and `<password>` in the string — this is your `MONGO_URI`

---

## Step 2 — Deploy Backend to Render

1. Push the entire `campus-care/` folder to a GitHub repository
2. Go to https://render.com → **New Web Service**
3. Connect your GitHub repo
4. Set the **Root Directory** to `backend`
5. Set these values:
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Environment**: Node
6. Add the following **Environment Variables**:

```
NODE_ENV=production
PORT=5000
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<generate a random 64-char string>
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=<your Anthropic API key from console.anthropic.com>
CLIENT_URL=https://your-app.vercel.app   ← fill this after Step 3
```

7. Click **Deploy** — note your Render URL (e.g. `https://campus-care-api.onrender.com`)

---

## Step 3 — Deploy Frontend to Vercel

1. Go to https://vercel.com → **New Project**
2. Import your GitHub repo
3. Set the **Root Directory** to `frontend`
4. Add this **Environment Variable**:

```
REACT_APP_API_URL=https://campus-care-api.onrender.com/api
```

5. Click **Deploy** — note your Vercel URL (e.g. `https://campus-care.vercel.app`)
6. Go back to Render → update `CLIENT_URL` to your Vercel URL → redeploy

---

## Step 4 — Create Admin User

After backend is live, register normally via the app with role = "admin", or use this curl command:

```bash
curl -X POST https://your-render-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. S. B. Bokefode",
    "email": "admin@campus.edu",
    "password": "yourpassword",
    "role": "admin"
  }'
```

---

## Local Development

### Backend
```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev                  # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm install
npm start                    # runs on http://localhost:3000
```

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | ✗ | Register user |
| POST | /api/auth/login | ✗ | Login, get JWT |
| GET | /api/auth/me | ✓ | Get current user |
| POST | /api/mood | ✓ Student | Log mood |
| GET | /api/mood | ✓ Student | Get mood history |
| GET | /api/mood/stats | ✓ Student | Mood breakdown |
| POST | /api/bookings | ✓ Student | Book session |
| GET | /api/bookings | ✓ Student | My bookings |
| PATCH | /api/bookings/:id/cancel | ✓ Student | Cancel booking |
| GET | /api/forum | ✓ | Get posts |
| POST | /api/forum | ✓ | Create post |
| POST | /api/forum/:id/like | ✓ | Like/unlike |
| POST | /api/chatbot | ✓ | AI chat message |
| GET | /api/admin/stats | ✓ Admin | Platform stats |
| GET | /api/admin/posts | ✓ Admin | All forum posts |
| PATCH | /api/admin/posts/:id/remove | ✓ Admin | Remove post |
| PATCH | /api/admin/bookings/:id/status | ✓ Admin | Update booking |

---

## Features

- JWT authentication with role-based access (student / admin)
- AI chatbot powered by Claude (server-side, API key never exposed to client)
- Mood tracking with history stored in MongoDB
- Confidential counselling booking system
- Anonymous peer support forum with moderation
- Admin dashboard with live analytics
- Rate limiting & helmet security headers
- Password hashing with bcrypt
