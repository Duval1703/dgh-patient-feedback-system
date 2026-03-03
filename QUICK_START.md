# ⚡ Quick Start Deployment Guide

**Time to deploy: ~20 minutes**

## 🎯 Three Simple Steps

### 1️⃣ Database (Supabase) - 5 minutes

1. Go to [supabase.com](https://supabase.com) → Sign up with GitHub
2. New Project → Name: `dgh-feedback`, Set password, Create
3. SQL Editor → New Query → Paste `database_schema.sql` → Run
4. Settings → Database → Copy connection URI
   ```
   postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### 2️⃣ Backend (Render) - 10 minutes

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. New + → Web Service → Select your GitHub repo
3. Settings:
   - Name: `dgh-patient-feedback-api`
   - Build: `cd backend && pip install -r requirements.txt`
   - Start: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   ```
   DATABASE_URL = <paste from step 1>
   SECRET_KEY = <run: python -c "import secrets; print(secrets.token_hex(32))">
   ALGORITHM = HS256
   ```
5. Create → Wait for deploy → Copy URL

### 3️⃣ Frontend (Netlify) - 5 minutes

1. Update `Frontend/.env.production`:
   ```
   VITE_BACKEND_URL=https://your-render-url.onrender.com
   ```
2. Commit & push:
   ```bash
   git add . && git commit -m "Deploy config" && git push
   ```
3. Go to [netlify.com](https://netlify.com) → Sign up with GitHub
4. New site → Import → Select repo
5. Settings:
   - Base: `Frontend`
   - Build: `npm install --include=dev && npm run build`
   - Publish: `Frontend/dist`
6. Deploy → Copy URL

## ✅ Test

- Backend: Visit `https://your-render-url.onrender.com/health`
- Frontend: Visit `https://your-netlify-url.netlify.app`
- Login: `admin@gmail.com` / `admin`

## 🎉 Done!

**Your app is live and free forever!**

See `DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.
