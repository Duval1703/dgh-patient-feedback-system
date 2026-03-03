# 🔗 GitHub Setup Guide

## ✅ Step 1: Create GitHub Repository (5 minutes)

### Option A: Via GitHub Website (Easiest)

1. **Go to GitHub**: [https://github.com/new](https://github.com/new)

2. **Fill in repository details**:
   - **Repository name**: `dgh-patient-feedback-system` (or any name you prefer)
   - **Description**: `Douala General Hospital Patient Feedback and Reminder System`
   - **Visibility**: Choose `Public` or `Private`
   - **⚠️ IMPORTANT**: Do NOT initialize with README, .gitignore, or license
     - [ ] Uncheck "Add a README file"
     - [ ] Uncheck "Add .gitignore"
     - [ ] Uncheck "Choose a license"

3. **Click "Create repository"**

4. **Copy the repository URL** - You'll see something like:
   ```
   https://github.com/YOUR-USERNAME/dgh-patient-feedback-system.git
   ```

---

## 📤 Step 2: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these:

### Connect your local repository to GitHub:

```bash
git remote add origin https://github.com/YOUR-USERNAME/dgh-patient-feedback-system.git
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

### Push your code:

```bash
git branch -M main
git push -u origin main
```

### Verify it worked:

Visit your repository on GitHub:
```
https://github.com/YOUR-USERNAME/dgh-patient-feedback-system
```

You should see all your files!

---

## 🎯 Quick Commands Summary

Copy and paste these commands (replace YOUR-USERNAME):

```bash
# 1. Add remote repository
git remote add origin https://github.com/YOUR-USERNAME/dgh-patient-feedback-system.git

# 2. Rename branch to main
git branch -M main

# 3. Push to GitHub
git push -u origin main
```

---

## 🆘 Troubleshooting

### Error: "remote origin already exists"
```bash
# Remove the existing remote and add again
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/dgh-patient-feedback-system.git
```

### Error: "Authentication failed"
- Make sure you're logged into GitHub
- You may need to use a Personal Access Token instead of password
- GitHub stopped accepting passwords in August 2021

**To create a Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Select `repo` scope
3. Copy the token (save it somewhere safe!)
4. Use this token as your password when pushing

**Or use GitHub CLI (easier):**
```bash
# Install GitHub CLI from: https://cli.github.com/
gh auth login
```

### Error: "Permission denied"
- Make sure you own the repository
- Check that the repository URL is correct

---

## ✅ After Successful Push

Once your code is on GitHub, you can proceed with deployment:

1. ✅ **Supabase** - Uses the `database_schema.sql` file
2. ✅ **Render** - Will connect to your GitHub repository
3. ✅ **Netlify** - Will connect to your GitHub repository

---

## 🔄 Future Updates

After you've pushed to GitHub, any future changes follow this pattern:

```bash
# 1. Make your changes to files
# 2. Add changes
git add .

# 3. Commit with a message
git commit -m "Description of what you changed"

# 4. Push to GitHub
git push
```

Then Render and Netlify will auto-deploy your changes!

---

## 📝 Next Steps

After GitHub setup:

1. ✅ Push code to GitHub (you're doing this now!)
2. 📖 Open `QUICK_START.md` 
3. 🚀 Start deployment (Database → Backend → Frontend)

---

## 🎉 You're Almost There!

Once you push to GitHub, you're ready to deploy to the cloud!
