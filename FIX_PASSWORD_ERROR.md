# 🔑 Fix: Password Authentication Failed

## Error Message
```
FATAL: password authentication failed for user "postgres"
connection to server at "aws-1-eu-west-1.pooler.supabase.com"
```

## ✅ This Means:
- ✅ DATABASE_URL is set correctly in Render
- ✅ Connection reached Supabase server
- ❌ **Password is incorrect**

---

## 🔧 Solution: Fix Your DATABASE_URL Password

### Option 1: Get Correct Connection String from Supabase (RECOMMENDED)

#### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Click your project: `dgh-patient-feedback`
3. Click **Settings** (gear icon) → **Database**

#### Step 2: Reset Database Password (Easiest)
1. In the Database settings, scroll to **"Database Password"**
2. Click **"Reset database password"**
3. Create a NEW password (save it somewhere safe!)
   - Use a simple password like: `MyDGHPassword123!`
   - Or let Supabase generate one
4. Click **"Reset password"**
5. **COPY THE PASSWORD** - you won't see it again!

#### Step 3: Get Connection String
1. Scroll to **"Connection string"** section
2. **Select "URI" mode**
3. **Select "Use connection pooling"** (important!)
4. You'll see:
   ```
   postgresql://postgres.mophtzlgugcplafyejfh:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
   ```
5. **Replace `[YOUR-PASSWORD]`** with the password you just created/copied
6. **Copy the complete URL**

**Example of correct URL:**
```
postgresql://postgres.mophtzlgugcplafyejfh:MyDGHPassword123!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

---

### Option 2: If Password Has Special Characters

If your password contains these characters, you MUST URL-encode them:

| Character | Encode As |
|-----------|-----------|
| `@` | `%40` |
| `!` | `%21` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |

**Example:**
- Original password: `My@Pass!word#123`
- Encoded password: `My%40Pass%21word%23123`
- Full URL: `postgresql://postgres.xxx:My%40Pass%21word%23123@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`

---

### Option 3: Use Simple Password (Recommended for Testing)

**Create a NEW database password without special characters:**
1. Reset password in Supabase
2. Use only letters and numbers: `DGHPassword2025`
3. No need to URL-encode!

---

## 📝 Update DATABASE_URL in Render

### Step 1: Copy Your Correct URL
Make sure you have the complete URL from Supabase with:
- Correct password (not `[YOUR-PASSWORD]`)
- URL-encoded if it has special characters

### Step 2: Update in Render
1. Go to: https://dashboard.render.com
2. Click your service: `dgh-patient-feedback-api`
3. Click **"Environment"** tab
4. Find `DATABASE_URL`
5. Click **"Edit"** (pencil icon)
6. **Delete the old value**
7. **Paste the new connection string**
8. Click **"Save Changes"**

### Step 3: Wait for Redeploy
- Render will automatically redeploy (2-3 minutes)
- Watch the **Logs** tab
- Look for: `INFO: Application startup complete`

---

## ✅ Verify It Works

### Check Render Logs
You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000
```

### Test Health Endpoint
Visit: `https://your-service.onrender.com/health`

Should return:
```json
{"status": "healthy", "service": "DGH Care API"}
```

---

## 🆘 Still Getting Password Error?

### Check These:

1. **Password is correct**
   - Try logging into Supabase SQL Editor with same password
   - If it fails there too, reset the password

2. **No extra spaces**
   - Make sure no spaces before/after password
   - Copy-paste carefully

3. **Special characters encoded**
   - If password has `@!#$%` etc., they must be URL-encoded

4. **Using pooler endpoint**
   - URL should have `:6543` (pooler) not `:5432` (direct)
   - Format: `aws-1-eu-west-1.pooler.supabase.com:6543`

5. **Complete URL**
   - Must start with `postgresql://` (not `postgres://`)
   - Must have all parts: `postgresql://user:pass@host:port/database`

---

## 🎯 Quick Test: Verify Password Locally

If you have Python installed locally, test the connection:

```python
import os
import psycopg2

# Replace with your actual DATABASE_URL
DATABASE_URL = "postgresql://postgres.xxx:YourPassword@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("✅ Connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

---

## 📋 Common Mistakes

| Mistake | Fix |
|---------|-----|
| Used `[YOUR-PASSWORD]` literally | Replace with actual password |
| Forgot to URL-encode special chars | Encode `@` → `%40`, `!` → `%21`, etc. |
| Used direct connection (`:5432`) | Use pooler (`:6543`) |
| Extra spaces in DATABASE_URL | Remove all spaces |
| Wrong Supabase project | Verify project ID in URL |
| Using old/expired password | Reset password in Supabase |

---

## ✅ Success Checklist

- [ ] Reset Supabase database password
- [ ] Copied new password
- [ ] Built complete DATABASE_URL
- [ ] URL-encoded special characters (if any)
- [ ] Updated DATABASE_URL in Render
- [ ] Saved changes
- [ ] Waited for redeploy
- [ ] Checked logs for success
- [ ] Tested /health endpoint

---

**After fixing this, your backend will be live! 🎉**
