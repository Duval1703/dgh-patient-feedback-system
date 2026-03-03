# 🚀 Deployment Guide - DGH Patient Feedback System

This guide will walk you through deploying the Douala General Hospital Patient Feedback System using **Render + Netlify + Supabase** (100% Free).

## 📋 Prerequisites

You'll need accounts on:
- [Supabase](https://supabase.com) - For PostgreSQL database
- [Render](https://render.com) - For backend API
- [Netlify](https://netlify.com) - For frontend
- [Twilio](https://twilio.com) (Optional) - For SMS reminders

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Fill in:
   - **Name**: `dgh-patient-feedback`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., `West EU` for Africa)
5. Click **"Create new project"** (takes ~2 minutes)

### 1.2 Run Database Schema
1. Once project is ready, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste the entire contents of `database_schema.sql` file
4. Click **"Run"** button
5. You should see: "Database schema created successfully!"

### 1.3 Get Database Connection String
1. Click **"Project Settings"** (gear icon) in left sidebar
2. Click **"Database"** tab
3. Scroll to **"Connection string"** section
4. Select **"URI"** mode
5. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your actual database password
7. **SAVE THIS** - you'll need it for Render!

---

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Prepare Your Code Repository
1. Make sure your code is pushed to **GitHub**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

### 2.2 Create Render Account & Deploy
1. Go to [https://render.com](https://render.com)
2. Sign up with **GitHub**
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Select your repository: `your-username/your-repo-name`

### 2.3 Configure Web Service
Fill in the following settings:

**Basic Settings:**
- **Name**: `dgh-patient-feedback-api`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Python 3`
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Instance Type:**
- Select **"Free"**

### 2.4 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres` (from Step 1.3) |
| `SECRET_KEY` | Generate random: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
| `TWILIO_ACCOUNT_SID` | `your_twilio_sid` (optional, if you have Twilio) |
| `TWILIO_AUTH_TOKEN` | `your_twilio_token` (optional) |
| `TWILIO_PHONE_NUMBER` | `your_twilio_number` (optional) |

**Important:** For `SECRET_KEY`, generate a secure random key:
```bash
# On your computer, run:
python -c "import secrets; print(secrets.token_hex(32))"
```

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Once deployed, you'll get a URL like: `https://dgh-patient-feedback-api.onrender.com`
4. **SAVE THIS URL** - you'll need it for frontend!

### 2.6 Test Backend
Visit: `https://your-backend-url.onrender.com/health`

You should see:
```json
{"status": "healthy", "service": "DGH Care API"}
```

---

## 🎨 Step 3: Deploy Frontend to Netlify

### 3.1 Update Frontend Environment
1. Open `Frontend/.env.production`
2. Replace the URL with your actual Render backend URL:
   ```
   VITE_BACKEND_URL=https://dgh-patient-feedback-api.onrender.com
   ```
3. Save and commit:
   ```bash
   git add Frontend/.env.production
   git commit -m "Update production backend URL"
   git push origin main
   ```

### 3.2 Create Netlify Account & Deploy
1. Go to [https://netlify.com](https://netlify.com)
2. Sign up with **GitHub**
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **"GitHub"**
5. Select your repository
6. Configure build settings:

**Build Settings:**
- **Base directory**: `Frontend`
- **Build command**: `npm install --include=dev && npm run build`
- **Publish directory**: `Frontend/dist`

**Environment Variables:**
Click **"Show advanced"** → **"New variable"**

| Key | Value |
|-----|-------|
| `VITE_BACKEND_URL` | `https://your-render-backend-url.onrender.com` |

### 3.3 Deploy
1. Click **"Deploy site"**
2. Wait 2-5 minutes for build
3. You'll get a URL like: `https://random-name-123.netlify.app`

### 3.4 (Optional) Custom Domain
1. In Netlify dashboard, click **"Domain settings"**
2. Click **"Add custom domain"**
3. Follow instructions to connect your domain

---

## ✅ Step 4: Test Your Deployment

### 4.1 Test Backend Health
Visit: `https://your-backend-url.onrender.com/health`

Expected response:
```json
{"status": "healthy", "service": "DGH Care API"}
```

### 4.2 Test Frontend
1. Visit your Netlify URL: `https://your-site.netlify.app`
2. You should see the landing page
3. Click **"Get Started"** or **"Login"**

### 4.3 Test Login
Try logging in with default credentials:

**Admin:**
- Email: `admin@gmail.com`
- Password: `admin`

**Doctor:**
- Email: `dr.smith@dghcare.cm`
- Password: `doctor123`

**Patient:**
- Email: `patient@test.com`
- Password: `patient123`

### 4.4 Test Feedback Submission
1. Login as patient
2. Navigate to "Submit Feedback"
3. Select a category, rate, and submit
4. Check if it appears in "Feedback History"

---

## 🔒 Important Security Notes

### Change Default Passwords!
After deployment, **immediately**:

1. Login as admin: `admin@gmail.com` / `admin`
2. Create new admin users with strong passwords
3. Delete or change default credentials in Supabase:

```sql
-- In Supabase SQL Editor, update admin password
UPDATE admins 
SET password = '$2b$12$YOUR_NEW_BCRYPT_HASH' 
WHERE email = 'admin@gmail.com';
```

To generate a bcrypt hash:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
print(pwd_context.hash("your_new_password"))
```

---

## 🐛 Troubleshooting

### Backend Issues

**Issue: "Application failed to respond"**
- Check Render logs: Dashboard → Logs
- Verify environment variables are set
- Check DATABASE_URL is correct

**Issue: "Database connection failed"**
- Verify Supabase database is running
- Check DATABASE_URL format
- Ensure password is correct (no special chars issues)

**Issue: "Cold start delay (15 min sleep)"**
- This is normal for Render free tier
- First request after 15 min takes ~30-60s
- Consider upgrading to paid tier ($7/month) for always-on

### Frontend Issues

**Issue: "Failed to fetch"**
- Check VITE_BACKEND_URL is correct
- Ensure backend is deployed and healthy
- Check CORS settings (already configured in backend)

**Issue: "Build failed"**
- Check build logs in Netlify
- Verify Node version (18 specified in netlify.toml)
- Ensure all dependencies are in package.json

### Database Issues

**Issue: "Relation does not exist"**
- Schema wasn't created properly
- Re-run database_schema.sql in Supabase SQL Editor

**Issue: "Password authentication failed"**
- Check DATABASE_URL password
- Ensure no spaces or special characters breaking the URL

---

## 📊 Monitoring

### Render Dashboard
- View logs: `https://dashboard.render.com/web/your-service`
- Monitor CPU/Memory usage
- Check deploy status

### Netlify Dashboard
- View build logs: `https://app.netlify.com/sites/your-site/deploys`
- Check bandwidth usage
- Monitor performance

### Supabase Dashboard
- Database size: Project Settings → Database
- Query performance: Database → Query Performance
- Backup data: Database → Backups

---

## 💰 Cost Breakdown (Free Tier Limits)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Supabase** | ✅ Free | 500MB DB, 2GB bandwidth/month |
| **Render** | ✅ Free | 750hrs/month, sleeps after 15min |
| **Netlify** | ✅ Free | 100GB bandwidth/month, 300 build min/month |
| **Total** | **$0/month** | Should handle ~1000-5000 users/month |

### When to Upgrade:

**Supabase ($25/month):**
- Database > 500MB
- Need more bandwidth

**Render ($7/month):**
- Need always-on backend (no cold starts)
- Higher traffic

**Netlify ($19/month):**
- Custom domain features
- More build minutes
- Analytics

---

## 🔄 Updating Your Deployment

### Backend Updates
1. Make changes to backend code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. Render auto-deploys (if enabled)
4. Check deploy logs in Render dashboard

### Frontend Updates
1. Make changes to frontend code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```
3. Netlify auto-deploys
4. Check build logs in Netlify dashboard

### Database Updates
1. Create migration SQL file
2. Run in Supabase SQL Editor
3. Or use Alembic for migrations (advanced)

---

## 📞 Support & Resources

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev

---

## ✨ Success Checklist

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] Backend deployed to Render
- [ ] Backend health check passes
- [ ] Frontend deployed to Netlify
- [ ] Frontend loads correctly
- [ ] Can login with test credentials
- [ ] Can submit feedback as patient
- [ ] Can view feedback as admin
- [ ] Changed default passwords

**Congratulations! Your DGH Patient Feedback System is now live! 🎉**

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review service logs (Render/Netlify/Supabase)
3. Verify all environment variables are correct
4. Ensure database schema was created successfully

Common first deployment issues:
- Wrong DATABASE_URL format
- Missing environment variables
- Database schema not executed
- Frontend can't connect to backend (CORS/URL)
