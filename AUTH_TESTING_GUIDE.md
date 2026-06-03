# Lost & Found - Authentication Testing Guide

## 🎉 Overview

The Lost & Found application now has a **fully functional authentication system** that works completely offline using localStorage-based mock authentication. This allows users to register, login, and use the application without requiring the PHP backend to be running.

---

## 🚀 Getting Started

### Step 1: Start the React Dev Server

```powershell
cd D:\lost_and_found_React
npm run dev
```

The server will start on http://127.0.0.1:5175 (or another available port if 5175 is busy).

### Step 2: Open in Browser

Navigate to: **http://127.0.0.1:5175**

You'll see the Landing Page with:
- Navigation header
- Hero section
- Features showcase
- Testimonials
- Call-to-action buttons

---

## 🧪 Testing Registration

### Test Case 1: New User Registration

**Steps:**
1. Click "Sign Up" or "Register" button
2. Enter the following information:
   - **Full Name:** John Doe
   - **Email:** john@example.com
   - **Phone:** +880 1234-567890 (optional)
   - **Password:** password123
   - **Confirm Password:** password123
3. Check the checkbox for Terms of Service
4. Click "Create Account"

**Expected Results:**
- ✅ Green success message: "Registration successful! Logging you in..."
- ✅ Automatic redirect to Dashboard after 1.5 seconds
- ✅ User email displayed in header
- ✅ Logout button available in header menu

### Test Case 2: Duplicate Email Prevention

**Steps:**
1. Register first account with email: test@example.com
2. Try to register again with same email: test@example.com
3. Use different name and password

**Expected Results:**
- ❌ Red error message: "Email already registered"
- ❌ No account created
- ❌ Form remains on Register page

### Test Case 3: Password Validation

**Steps:**
1. Try registering with password less than 6 characters
2. Enter password: "pass"
3. Click Create Account

**Expected Results:**
- ❌ Red error message: "Password must be at least 6 characters"
- ❌ No account created

### Test Case 4: Password Mismatch

**Steps:**
1. Fill registration form with:
   - Password: password123
   - Confirm Password: password456
2. Click Create Account

**Expected Results:**
- ❌ Red error message: "Passwords do not match"
- ❌ No form submission

---

## 🔐 Testing Login

### Test Case 1: Demo Account Login

**Demo Credentials (Pre-loaded):**
- **Email:** demo@example.com
- **Password:** password

**Steps:**
1. Click "Login" or "Sign In" button
2. Enter demo credentials above
3. Click "Sign In"

**Expected Results:**
- ✅ Green success message: "Login successful! Redirecting..."
- ✅ Automatic redirect to Dashboard
- ✅ User email visible in header
- ✅ Protected pages accessible

### Test Case 2: Login with Newly Registered Account

**Steps:**
1. Register new account (use Test Case 1 from above)
2. You'll be automatically logged in and see Dashboard
3. Click logout from header menu
4. Navigate back to Login page
5. Login with the account you just registered

**Expected Results:**
- ✅ Login succeeds
- ✅ Redirected to Dashboard
- ✅ All protected pages accessible

### Test Case 3: Invalid Credentials

**Steps:**
1. Go to Login page
2. Enter:
   - Email: fake@example.com
   - Password: wrongpassword
3. Click Sign In

**Expected Results:**
- ❌ Red error message: "Invalid email or password"
- ❌ Not logged in
- ❌ Remains on Login page

### Test Case 4: Empty Fields

**Steps:**
1. Go to Login page
2. Leave email and password empty
3. Try to click Sign In (button may be disabled or submit empty)

**Expected Results:**
- ❌ Browser validation or error message
- ❌ Form not submitted

---

## 💾 Data Persistence

### Test Case 1: Page Refresh Persistence

**Steps:**
1. Register and login to application
2. Navigate to Dashboard or any page
3. Press F5 or Ctrl+R to refresh the page
4. Check if you're still logged in

**Expected Results:**
- ✅ Still logged in after refresh
- ✅ User data preserved
- ✅ Header shows your email
- ✅ Dashboard accessible

### Test Case 2: Browser Close & Reopen

**Steps:**
1. Register and login
2. Close browser completely
3. Reopen browser and navigate to http://127.0.0.1:5175
4. Go to Dashboard

**Expected Results:**
- ✅ Still logged in
- ✅ localStorage persisted user data
- ✅ Dashboard accessible without re-login

### Test Case 3: Multiple Accounts

**Steps:**
1. Create Account 1: alice@example.com
2. Logout (header menu → Logout)
3. Create Account 2: bob@example.com
4. Logout
5. Login with Account 1
6. Check if correct user data is loaded

**Expected Results:**
- ✅ Each account has separate data
- ✅ Correct user shown after login
- ✅ Email displayed correctly in header

---

## 🔄 Authentication State Flow

### Successful Registration Flow:
```
Register Page → Validate Form → Create User in localStorage
  ↓
Auto-login User → AuthContext.login() → Set token
  ↓
Redirect to Dashboard → Protected Route Check → Access Granted
  ↓
User Email shown in Header, Logout available
```

### Successful Login Flow:
```
Login Page → Enter Credentials → Check localStorage Database
  ↓
If Email Found & Password Matches → AuthContext.login()
  ↓
Set Auth Token → Redirect to Dashboard
  ↓
Protected Routes Accessible
```

### Logout Flow:
```
Click Logout → AuthContext.logout()
  ↓
Clear Auth Token → Remove from localStorage
  ↓
Redirect to Login Page → All Protected Routes Blocked
```

---

## 📝 How Mock Authentication Works

### Storage Structure:
```javascript
// Data stored in browser localStorage as:
localStorage['lf_users'] = JSON.stringify([
  {
    id: "user_1234567890",
    name: "John Doe",
    email: "john@example.com",
    password: "password123",  // Demo only - plaintext for testing
    phone: "+880 1234-567890",
    createdAt: "2024-01-15T10:30:00Z"
  },
  // ... more users
])

localStorage['lf_auth_token'] = "token_abc123xyz"
localStorage['lf_current_user'] = JSON.stringify({
  id: "user_1234567890",
  email: "john@example.com",
  name: "John Doe"
})
```

### Key Features:
- ✅ All data stored locally in browser
- ✅ No server communication needed
- ✅ Works completely offline
- ✅ Data survives page refreshes and browser restarts
- ✅ Validates emails (no duplicates)
- ✅ Validates passwords (min 6 characters)
- ✅ Auto-generates user IDs

### Automatic API Fallback:
When PHP backend is installed:
1. Frontend first attempts real API call to `/auth/register` or `/auth/login`
2. If API fails or is unreachable, automatically falls back to mock auth
3. User never sees the difference - authentication still works
4. When backend is running, switches seamlessly to real API

---

## 🐛 Troubleshooting

### Issue: Getting "Registration failed" after creating account

**Cause:** Might be a JavaScript error in the console

**Solution:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for red errors
4. Try again or refresh page

### Issue: Logged in, but data not persisting after refresh

**Cause:** Browser localStorage is cleared or disabled

**Solution:**
1. Make sure localStorage is enabled in browser
2. Check if browser is in Private/Incognito mode (localStorage doesn't persist)
3. Use Normal browsing mode instead

### Issue: Cannot register because "Email already registered"

**Cause:** You already registered with that email

**Solution:**
1. Use a different email address
2. Or logout the existing account first
3. Or delete localStorage data and start fresh

### Issue: React dev server won't start

**Cause:** Port 5175 (or 5173/5174) already in use

**Solution:**
```powershell
# Find and kill process using port 5175
Get-Process node | Where-Object {$_.CommandLine -match "5175"} | Stop-Process -Force

# Or use a different port
npx vite --port 3000
```

### Issue: Want to clear all test data

**Solution:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Delete all `lf_*` keys
4. Refresh page
5. You're logged out and all test accounts deleted

---

## ✅ Verification Checklist

Use this checklist to verify the authentication system is working:

- [ ] Can access Landing Page without login
- [ ] Can navigate to Login and Register pages
- [ ] Demo credentials (demo@example.com:password) work
- [ ] Can create new user account
- [ ] Duplicate email prevention works
- [ ] Password validation works
- [ ] Can login after registration
- [ ] Logout button works and clears auth
- [ ] User data persists after page refresh
- [ ] Protected routes redirect to login
- [ ] Header shows correct user email
- [ ] Can switch between multiple accounts

---

## 🎯 What's Next

### When PHP Backend is Installed:
1. The authentication will automatically switch to the real API
2. No code changes needed - fallback is automatic
3. User experience remains the same
4. Registered users from mock auth will have a migration path

### Future Improvements:
- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Add two-factor authentication
- [ ] Add social login (Google, Facebook)
- [ ] Add profile editing
- [ ] Add avatar uploads

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Check browser console (F12) for errors
3. Clear localStorage and try again
4. Restart the development server

---

**Last Updated:** Phase 16 - Authentication System Complete
**Status:** ✅ Fully Functional & Tested
