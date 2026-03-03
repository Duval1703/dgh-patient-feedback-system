# 🔄 Manual Redeploy Instructions for Render

## The CORS fix is already in GitHub!

The code with the CORS fix has been on GitHub for 22 minutes in commit:
`2e8ae8f Fix CORS: Allow Netlify frontend domain`

**If Render hasn't auto-deployed, you need to trigger a manual deploy.**

---

## 🔧 Manual Redeploy on Render

### Step 1: Go to Render Dashboard
1. Visit: https://dashboard.render.com
2. Click on your service: `dgh-patient-feedback-system`

### Step 2: Check Auto-Deploy Settings
1. Click **"Settings"** tab
2. Scroll to **"Build & Deploy"** section
3. Check if **"Auto-Deploy"** is set to **"Yes"**
   - If it's "No", that's why it didn't redeploy!
   - Change it to "Yes" for future updates

### Step 3: Manual Deploy
1. Click **"Manual Deploy"** button (top right)
2. Select **"Deploy latest commit"**
3. Click **"Deploy"**

OR

1. Go to **"Deploys"** tab (left sidebar)
2. Click **"Manual Deploy"** button
3. Select **"Clear build cache & deploy"** (recommended)
4. Click **"Deploy"**

### Step 4: Monitor Deployment
1. Click **"Logs"** tab
2. Watch for:
   ```
   ==> Build successful 🎉
   ==> Deploying...
   ==> Your service is live 🎉
   ```

**This takes 2-3 minutes**

---

## ✅ After Deployment Completes

### Test Backend Health
Visit: https://dgh-patient-feedback-system.onrender.com/health

Should return:
```json
{"status": "healthy", "service": "DGH Care API"}
```

### Test Frontend Login
1. Go to: https://sparkling-sprinkles-24d64b.netlify.app
2. Click **Login**
3. Enter:
   - Email: `admin@gmail.com`
   - Password: `admin`
4. Click **Sign In**

**If it works:** ✅ You're done!

**If CORS error persists:** Check Render logs to verify the new code deployed

---

## 🔍 Verify CORS Settings in Render Logs

After deployment, check the logs. You should NOT see any CORS errors when trying to login.

Look for successful requests like:
```
INFO: 127.0.0.1 - "POST /auth/token HTTP/1.1" 200 OK
```

NOT:
```
OPTIONS /auth/token
GET /auth/token - 403 Forbidden
```

---

## 🆘 If Manual Deploy Fails

### Check Environment Variables
Make sure these are set in Render:
- `DATABASE_URL` (from Supabase)
- `SECRET_KEY`
- `ALGORITHM` = `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` = `30`

### Check Build Logs
If build fails:
1. Click **"Logs"** tab
2. Look for error messages
3. Common issues:
   - Missing dependencies
   - Database connection issues
   - Python version mismatch

---

## 📞 Quick Summary

**Problem:** Render didn't auto-deploy the CORS fix from GitHub

**Solution:** 
1. Go to Render Dashboard
2. Click "Manual Deploy"
3. Wait 2-3 minutes
4. Test login on Netlify

**Expected Result:** Login works without CORS errors! 🎉
