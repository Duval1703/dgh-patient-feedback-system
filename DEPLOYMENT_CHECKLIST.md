# ✅ Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment

- [ ] Code is committed to GitHub repository
- [ ] Have reviewed `QUICK_START.md` or `DEPLOYMENT_GUIDE.md`
- [ ] Created accounts (Supabase, Render, Netlify)
- [ ] Have `SECRET_KEY` ready (see `README_DEPLOYMENT.md`)

---

## 1. Database Setup (Supabase)

- [ ] Created Supabase account
- [ ] Created new project: `dgh-patient-feedback`
- [ ] Set and saved database password
- [ ] Opened SQL Editor
- [ ] Pasted and ran `database_schema.sql`
- [ ] Verified success message appeared
- [ ] Copied database connection URI
- [ ] Saved DATABASE_URL securely

**DATABASE_URL format:**
```
postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

---

## 2. Backend Deployment (Render)

- [ ] Created Render account with GitHub
- [ ] Created new Web Service
- [ ] Connected GitHub repository
- [ ] Configured service settings:
  - [ ] Name: `dgh-patient-feedback-api`
  - [ ] Runtime: Python 3
  - [ ] Build command: `cd backend && pip install -r requirements.txt`
  - [ ] Start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - [ ] Instance: Free
- [ ] Added environment variables:
  - [ ] `DATABASE_URL` (from Supabase)
  - [ ] `SECRET_KEY` (generated)
  - [ ] `ALGORITHM` = HS256
  - [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` = 30
  - [ ] (Optional) Twilio credentials
- [ ] Clicked "Create Web Service"
- [ ] Waited for deployment to complete
- [ ] Copied backend URL
- [ ] Tested health endpoint: `https://your-url.onrender.com/health`
- [ ] Verified response: `{"status": "healthy", "service": "DGH Care API"}`

**Backend URL:** _______________________________

---

## 3. Frontend Deployment (Netlify)

- [ ] Updated `Frontend/.env.production` with backend URL
- [ ] Committed and pushed changes to GitHub
- [ ] Created Netlify account with GitHub
- [ ] Created new site from Git
- [ ] Selected GitHub repository
- [ ] Configured build settings:
  - [ ] Base directory: `Frontend`
  - [ ] Build command: `npm install --include=dev && npm run build`
  - [ ] Publish directory: `Frontend/dist`
- [ ] Added environment variable:
  - [ ] `VITE_BACKEND_URL` = (backend URL from Render)
- [ ] Clicked "Deploy site"
- [ ] Waited for build to complete
- [ ] Copied frontend URL
- [ ] Visited frontend URL
- [ ] Verified landing page loads

**Frontend URL:** _______________________________

---

## 4. Testing

### Backend Tests
- [ ] Health check works: `/health`
- [ ] Returns proper JSON response
- [ ] No errors in Render logs

### Frontend Tests
- [ ] Landing page loads
- [ ] Can navigate to login page
- [ ] Login form displays correctly

### Authentication Tests
- [ ] Can login as Admin (admin@gmail.com / admin)
- [ ] Can login as Doctor (dr.smith@dghcare.cm / doctor123)
- [ ] Can login as Patient (patient@test.com / patient123)
- [ ] Dashboard loads after login
- [ ] Can logout successfully

### Functionality Tests (Patient)
- [ ] Can submit feedback
- [ ] Can select categories
- [ ] Can rate with stars
- [ ] Can add comments
- [ ] Feedback appears in history
- [ ] Can view appointments
- [ ] Can view medications

### Functionality Tests (Admin)
- [ ] Can view all feedback
- [ ] Patient names are anonymized
- [ ] Can reply to feedback
- [ ] Can view analytics dashboard
- [ ] Replies appear to patients

### Functionality Tests (Doctor)
- [ ] Can view feedback about them
- [ ] Patient names are anonymized
- [ ] Can view appointments
- [ ] Can prescribe medications

---

## 5. Security

- [ ] Changed admin password from default
- [ ] Changed test doctor passwords
- [ ] Changed test patient password
- [ ] SECRET_KEY is secure and not exposed
- [ ] DATABASE_URL is not in Git
- [ ] Twilio credentials (if used) are secure
- [ ] Reviewed `CREDENTIALS.md` security section

---

## 6. Monitoring Setup

- [ ] Bookmarked Render dashboard
- [ ] Bookmarked Netlify dashboard
- [ ] Bookmarked Supabase dashboard
- [ ] Tested viewing logs in Render
- [ ] Tested viewing build logs in Netlify
- [ ] Checked database size in Supabase

---

## 7. Documentation

- [ ] Saved backend URL
- [ ] Saved frontend URL
- [ ] Saved database credentials
- [ ] Documented admin credentials (changed from default)
- [ ] Saved this checklist with URLs filled in

---

## 8. Optional Enhancements

- [ ] Set up custom domain in Netlify
- [ ] Configured Twilio for SMS reminders
- [ ] Set up monitoring/alerts
- [ ] Added SSL certificate (auto in Netlify/Render)
- [ ] Configured backup strategy in Supabase

---

## 🎉 Deployment Complete!

- [ ] All core features tested and working
- [ ] All default passwords changed
- [ ] System is live and accessible
- [ ] Team members can access the system

**Deployment Date:** _______________________________

**Deployed By:** _______________________________

---

## 📝 Notes & Issues

Use this space to document any issues encountered or notes for future reference:

```
Issue 1:
Solution:

Issue 2:
Solution:

Notes:
```

---

## 🔄 Next Steps

After successful deployment:

1. **Share access**: Give team members the frontend URL
2. **Create real users**: Add actual doctors, patients, admins
3. **Monitor usage**: Check logs and performance regularly
4. **Backup data**: Supabase has auto-backups, but verify
5. **Plan updates**: Use Git workflow for future changes

---

## 🆘 Common Issues Quick Reference

| Issue | Solution |
|-------|----------|
| Backend won't start | Check DATABASE_URL format |
| Frontend can't connect | Verify VITE_BACKEND_URL is correct |
| Database errors | Re-run database_schema.sql |
| Login fails | Check if database has users |
| Cold start delay | Normal for Render free tier (30-60s) |

For detailed troubleshooting, see `DEPLOYMENT_GUIDE.md`.
