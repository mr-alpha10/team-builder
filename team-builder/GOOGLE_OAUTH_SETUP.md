# 🔧 FIX: Google OAuth "Access Blocked" Error

## The Issue
Google is blocking because the OAuth consent screen is not properly configured.

## ✅ STEP-BY-STEP FIX (5 Minutes)

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project (or create new one)

### Step 2: Configure OAuth Consent Screen

1. **Click on the menu (☰) → APIs & Services → OAuth consent screen**

2. **Choose User Type:**
   - Select: ✅ **External**
   - Click: **CREATE**

3. **App Information (Page 1):**
   ```
   App name: TeamBuilder
   User support email: [Select your email from dropdown]
   App logo: [Skip - click "Save and Continue"]
   ```

4. **App domain (Page 1 - scroll down):**
   ```
   Application home page: http://localhost:3000
   Application privacy policy link: http://localhost:3000
   Application terms of service link: http://localhost:3000
   ```
   
   **Authorized domains:** Leave EMPTY (important for localhost!)
   
   ```
   Developer contact information:
   Email addresses: [Your email]
   ```
   
   Click: **SAVE AND CONTINUE**

5. **Scopes (Page 2):**
   - Click: **ADD OR REMOVE SCOPES**
   - In the filter box, search: `userinfo`
   - Check these 3 boxes:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Click: **UPDATE**
   - Click: **SAVE AND CONTINUE**

6. **Test users (Page 3) - MOST IMPORTANT:**
   - Click: **+ ADD USERS**
   - Enter YOUR email address (the one you'll test with)
   - Click: **ADD**
   - Click: **SAVE AND CONTINUE**

7. **Summary (Page 4):**
   - Review everything
   - Click: **BACK TO DASHBOARD**

### Step 3: Verify OAuth Client Settings

1. **Go to: APIs & Services → Credentials**

2. **Click on your OAuth 2.0 Client ID** (under "OAuth 2.0 Client IDs")

3. **Verify these settings:**

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000
   http://localhost:5001/api/auth/google/callback
   ```

4. **If missing, click EDIT and add them**

5. **Click SAVE**

### Step 4: Wait & Clear Cache

1. **Wait 5 minutes** (Google needs time to propagate changes)

2. **Clear browser cache:**
   - Press F12 (DevTools)
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"
   
   OR
   
   - Press Ctrl+Shift+Delete
   - Select "Cached images and files"
   - Click "Clear data"

3. **Close all browser tabs** with your app

### Step 5: Test Again

1. **Restart backend:**
   ```bash
   cd backend
   # Ctrl+C to stop
   npm run dev
   ```

2. **Restart frontend:**
   ```bash
   cd frontend
   # Ctrl+C to stop
   npm run dev
   ```

3. **Open fresh tab:** http://localhost:3000/login

4. **Click "Sign in with Google"**

5. **Select the email you added as test user**

6. **Should work now!** ✅

## 🚨 Common Mistakes

### ❌ Mistake 1: Forgot to add test user
**Solution:** Go back to OAuth consent screen → Test users → Add your email

### ❌ Mistake 2: Used wrong email
**Solution:** Make sure you're signing in with the email you added as test user

### ❌ Mistake 3: Didn't wait for changes
**Solution:** Wait 5 minutes after saving changes in Google Console

### ❌ Mistake 4: Browser cache
**Solution:** Clear cache and cookies, or use incognito mode

### ❌ Mistake 5: Wrong redirect URIs
**Solution:** Must include `http://localhost:3000` (no trailing slash)

## 🔍 Troubleshooting

### Still seeing "Access blocked"?

**Check 1: Verify test user**
```
Google Console → OAuth consent screen → Test users
Should see your email listed
```

**Check 2: Verify app status**
```
OAuth consent screen → Publishing status
Should say: "Testing"
```

**Check 3: Try incognito mode**
```
Open incognito window
Go to http://localhost:3000/login
Try Google sign in
```

**Check 4: Check browser console**
```
F12 → Console tab
Look for errors
Share error message if any
```

### Different error messages:

**"redirect_uri_mismatch"**
- Add `http://localhost:3000` to Authorized redirect URIs

**"invalid_client"**
- Client ID doesn't match
- Check `.env` and `main.jsx` have same Client ID

**"access_denied"**
- User not in test users list
- Add email to test users

**"unauthorized_client"**
- OAuth consent screen not configured
- Follow Step 2 again

## 📸 Visual Checklist

After completing all steps, verify:

```
✅ OAuth consent screen configured
✅ User type: External
✅ App name: TeamBuilder
✅ Scopes added: email, profile, openid
✅ Test users: Your email added
✅ Publishing status: Testing
✅ Authorized JavaScript origins: http://localhost:3000
✅ Authorized redirect URIs: http://localhost:3000
✅ Client ID matches in code
✅ Waited 5 minutes
✅ Cache cleared
✅ Servers restarted
```

## 🎯 Quick Test

After setup, test with this checklist:

1. ✅ Open http://localhost:3000/login
2. ✅ See Google button
3. ✅ Click Google button
4. ✅ Google popup opens
5. ✅ Select your test user email
6. ✅ No "Access blocked" error
7. ✅ Redirects to dashboard
8. ✅ See your name in navbar

## 💡 Pro Tips

1. **Use incognito mode** for testing to avoid cache issues
2. **Add multiple test users** if testing with team
3. **Keep OAuth consent in "Testing"** until ready for production
4. **For production:** Submit app for verification
5. **Screenshot your settings** for reference

## 📞 Still Not Working?

If you've followed all steps and it still doesn't work:

1. **Delete the OAuth client**
   - Go to Credentials
   - Delete current OAuth 2.0 Client
   
2. **Create new OAuth client**
   - Click "Create Credentials"
   - Select "OAuth client ID"
   - Application type: "Web application"
   - Name: "TeamBuilder Web Client"
   - Add origins and redirect URIs
   - Click "Create"
   
3. **Update credentials in code**
   ```bash
   # backend/.env
   GOOGLE_CLIENT_ID=new_client_id_here
   GOOGLE_CLIENT_SECRET=new_client_secret_here
   
   # frontend/.env
   VITE_GOOGLE_CLIENT_ID=new_client_id_here
   ```
   
4. **Restart everything and test**

---

## ⏱️ Time Estimate
- First time: 10 minutes
- If you've done it before: 3 minutes
- Waiting for Google: 5 minutes

## 🎉 Success Indicator
When you see the Google account selector popup and can select your account without "Access blocked" error, you're done!

---

**Follow these steps exactly and Google OAuth will work!** 🚀
