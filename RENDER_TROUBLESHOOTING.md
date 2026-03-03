# 🔧 Render Deployment Troubleshooting

## Error: "Network is unreachable" / Database Connection Failed

### Problem
```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) 
connection to server at "db.mophtzlgugcplafyejfh.supabase.co" failed: 
Network is unreachable
```

### Root Cause
The backend cannot connect to Supabase database. This happens when:
1. DATABASE_URL environment variable is missing or incorrect
2. Database password contains special characters that need escaping
3. Database is not allowing connections from Render's IP

---

## ✅ Solution Steps

### Step 1: Get Correct DATABASE_URL from Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project: `dgh-patient-feedback`
3. Click **Settings** (gear icon) in left sidebar
4. Click **Database** tab
5. Scroll to **Connection string** section
6. Select **URI** mode
7. Copy the connection string - it looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

**IMPORTANT:** 
- Replace `[YOUR-PASSWORD]` with your actual database password
- Make sure there are NO spaces
- The format must be: `postgresql://` (not `postgres://`)

### Correct Format Example:
```
postgresql://postgres.mophtzlgugcplafyejfh:MyP@ssw0rd123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

### Step 2: Add DATABASE_URL to Render

1. Go to Render Dashboard: https://dashboard.render.com
2. Click on your backend service: `dgh-patient-feedback-api`
3. Click **Environment** in left sidebar
4. Find `DATABASE_URL` variable (or add it if missing):
   - Click **Add Environment Variable**
   - Key: `DATABASE_URL`
   - Value: `postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
5. Click **Save Changes**

**Render will automatically redeploy with the new variable**

---

### Step 3: Special Characters in Password

If your database password contains special characters like `@`, `#`, `!`, `%`, you need to URL-encode them:

| Character | URL Encoded |
|-----------|-------------|
| `@` | `%40` |
| `#` | `%23` |
| `!` | `%21` |
| `%` | `%25` |
| `&` | `%26` |
| `=` | `%3D` |
| `+` | `%2B` |
| ` ` (space) | `%20` |

**Example:**
- Password: `MyP@ss!word`
- Encoded: `MyP%40ss%21word`
- Full URL: `postgresql://postgres.xxx:MyP%40ss%21word@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

---

### Step 4: Verify Other Environment Variables

Make sure these are also set in Render:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres...` (from Supabase) |
| `SECRET_KEY` | `fa053e76736ad9495b47df7a0bdde7ba043f3347adba9224d81a056ba0b75a8c` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |

Optional (Twilio - can add later):
| Variable | Value |
|----------|-------|
| `TWILIO_ACCOUNT_SID` | Your Twilio SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio token |
| `TWILIO_PHONE_NUMBER` | Your Twilio number |

---

### Step 5: Use Supabase Connection Pooler

**IMPORTANT:** Use the **pooler** endpoint, not direct connection:

✅ **CORRECT** (with pooler):
```
postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```

❌ **WRONG** (direct connection):
```
postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres
```

The pooler (`:6543`) is better for serverless environments like Render.

---

## 🔍 How to Check If It's Fixed

### In Render Dashboard:

1. Go to your service
2. Click **Logs** tab
3. Watch for deployment
4. Look for these success messages:
   ```
   Starting service with 'cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT'
   INFO:     Started server process
   INFO:     Uvicorn running on http://0.0.0.0:10000
   INFO:     Application startup complete
   ```

### Test the Health Endpoint:

Once deployed, visit:
```
https://your-service-name.onrender.com/health
```

You should see:
```json
{"status": "healthy", "service": "DGH Care API"}
```

---

## 🆘 Still Having Issues?

### Check Supabase Database is Running

1. Go to Supabase Dashboard
2. Click your project
3. Check if status shows **Active** (green)
4. If it shows **Paused**, click **Resume**

### Check Render Build Logs

1. Render Dashboard → Your service
2. Click **Logs** tab
3. Look for the EXACT error message
4. Common errors:
   - `ModuleNotFoundError` → Missing dependency in requirements.txt
   - `Network unreachable` → DATABASE_URL issue
   - `Password authentication failed` → Wrong password in DATABASE_URL

### Verify DATABASE_URL Format

Run this check in Render Shell (or locally):

```python
import os
db_url = os.getenv("DATABASE_URL")
print(f"URL starts with postgresql://: {db_url.startswith('postgresql://')}")
print(f"URL length: {len(db_url)}")
print(f"Contains pooler: {'pooler' in db_url}")
```

Should show:
```
URL starts with postgresql://: True
URL length: 100+ (varies)
Contains pooler: True
```

---

## ✅ Quick Checklist

Before saving changes in Render:

- [ ] DATABASE_URL starts with `postgresql://` (not `postgres://`)
- [ ] DATABASE_URL contains your actual password (not `[YOUR-PASSWORD]`)
- [ ] Special characters in password are URL-encoded
- [ ] Using pooler endpoint (`:6543`) not direct (`:5432`)
- [ ] SECRET_KEY is set
- [ ] ALGORITHM is set to `HS256`
- [ ] Supabase database is Active/Running
- [ ] Database schema was executed in Supabase SQL Editor

---

## 📞 Next Steps After Fix

1. Save environment variables in Render
2. Wait for automatic redeploy (~3-5 minutes)
3. Check logs for success
4. Test health endpoint
5. Proceed to frontend deployment (Netlify)

---

**Good luck! This should fix your deployment issue!** 🚀
