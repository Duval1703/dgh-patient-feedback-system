# 🔐 Default Login Credentials

## ⚠️ Important Security Notice

**These are DEFAULT credentials for testing only!**  
**Change them immediately after first deployment!**

---

## 👤 Test Accounts

### Admin Account
- **Email**: `admin@gmail.com`
- **Password**: `admin`
- **Access**: Full system access, can reply to feedback, view analytics

### Doctor Accounts

**Dr. John Smith (Cardiology)**
- **Email**: `dr.smith@dghcare.cm`
- **Password**: `doctor123`
- **Specialty**: Cardiology

**Dr. Emily Wilson (Pediatrics)**
- **Email**: `dr.wilson@dghcare.cm`
- **Password**: `doctor123`
- **Specialty**: Pediatrics

**Dr. Michael Brown (Neurology)**
- **Email**: `dr.brown@dghcare.cm`
- **Password**: `doctor123`
- **Specialty**: Neurology

**Dr. Sarah Davis (Orthopedics)**
- **Email**: `dr.davis@dghcare.cm`
- **Password**: `doctor123`
- **Specialty**: Orthopedics

**Dr. James Johnson (General Medicine)**
- **Email**: `dr.johnson@dghcare.cm`
- **Password**: `doctor123`
- **Specialty**: General Medicine

### Patient Account
- **Email**: `patient@test.com`
- **Password**: `patient123`
- **Name**: John Doe
- **Phone**: +237123456789

---

## 🔒 How to Change Passwords

### Option 1: Via Application (Recommended)
1. Login with default credentials
2. Navigate to profile/settings
3. Update password
4. Logout and login with new password

### Option 2: Via Database (Supabase SQL Editor)

Generate new password hash in Python:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
new_hash = pwd_context.hash("your_new_secure_password")
print(new_hash)
```

Then update in Supabase:
```sql
-- Update admin password
UPDATE admins 
SET password = '$2b$12$YOUR_NEW_BCRYPT_HASH_HERE' 
WHERE email = 'admin@gmail.com';

-- Update doctor password
UPDATE doctors 
SET password = '$2b$12$YOUR_NEW_BCRYPT_HASH_HERE' 
WHERE email = 'dr.smith@dghcare.cm';

-- Update patient password
UPDATE patients 
SET password = '$2b$12$YOUR_NEW_BCRYPT_HASH_HERE' 
WHERE email = 'patient@test.com';
```

---

## 📝 Creating New Users

### Create New Admin (via Supabase SQL)
```sql
INSERT INTO admins (email, password, name) 
VALUES (
    'newadmin@dghcare.cm', 
    '$2b$12$YOUR_BCRYPT_HASH', 
    'Admin Name'
);
```

### Create New Doctor (via Supabase SQL)
```sql
INSERT INTO doctors (email, password, name, specialty, is_active) 
VALUES (
    'doctor@dghcare.cm',
    '$2b$12$YOUR_BCRYPT_HASH',
    'Dr. Full Name',
    'specialty_name',
    TRUE
);
```

### Create New Patient (via Application)
Patients should register through the application's signup feature.

---

## 🛡️ Security Best Practices

1. **Change ALL default passwords immediately after deployment**
2. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
3. **Never commit passwords** to Git (use environment variables)
4. **Enable 2FA** if implementing in future
5. **Regularly audit user accounts** and remove inactive ones
6. **Monitor login attempts** for suspicious activity
7. **Keep SECRET_KEY secure** and never expose it

---

## 🔑 Environment Variables (Production)

These should be set in Render dashboard:

```bash
# Generate a new secret key for production
SECRET_KEY=<generate using: python -c "import secrets; print(secrets.token_hex(32))">

# JWT Settings
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# Optional: Twilio for SMS
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
```

---

**Remember**: Security is an ongoing process. Regularly review and update your security practices!
