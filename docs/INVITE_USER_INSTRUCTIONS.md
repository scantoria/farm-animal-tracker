# Farm Animal Tracker - User Invitation System

## Overview

The signup functionality has been converted to an **invitation-only system**. Only authorized administrators can create new user accounts.

---

## Authorized Administrators

Only these two users can invite new users:
- **stephen.cantoria@stjo.farm**
- **jolene.cantoria@stjo.farm**

---

## How to Invite a New User

### Method 1: Hidden Invite Page (Recommended)

1. **Login** to the Farm Animal Tracker as an authorized admin
2. **Navigate** directly to the invite page:
```
   https://farmanimaltracker.web.app/admin/invite-user
   or
   https://fat.stjo.farm/admin/invite-user
```
3. **Fill out the form**:
   - Enter the new user's email address
   - Create a temporary password (minimum 6 characters)
4. **Click "Create User Account"**
5. **Share credentials** securely with the new user
6. **Advise them** to change their password after first login

### Method 2: Firebase Console (Alternative)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **farm-animal-tracker** project
3. Navigate to **Authentication** → **Users**
4. Click **Add user**
5. Enter email and password
6. Click **Add user**

---

## Important Notes

- ✅ The invite page is **NOT** linked in the navigation (hidden)
- ✅ Only Stephen and Jolene can access `/admin/invite-user`
- ✅ Anyone else trying to access it will be redirected to home
- ✅ The public signup route has been completely removed
- ✅ SignUp link removed from navigation
- ✅ The AuthService still has `signUp()` method for programmatic use

---

## Security Features

1. **Route Guard**: `AdminInviteGuard` checks user email before allowing access
2. **No Public Access**: Signup route removed from public routing
3. **Hidden Page**: Not linked anywhere in the UI
4. **Email Verification**: Optional (configure in Firebase Console)

---

## Troubleshooting

**Q: I can't access the invite page**
A: Make sure you're logged in as stephen.cantoria@stjo.farm or jolene.cantoria@stjo.farm

**Q: The page redirects me to home**
A: Only authorized admins can access this page. Check your login email.

**Q: User creation fails**
A: Check Firebase Console for errors. Password must be at least 6 characters.

**Q: Can I add more authorized admins?**
A: Yes! Edit `src/app/auth/admin-invite.guard.ts` and add emails to `AUTHORIZED_EMAILS` array.

---

## Adding More Authorized Admins

To add more people who can invite users:

1. Edit `src/app/auth/admin-invite.guard.ts`
2. Add email to the `AUTHORIZED_EMAILS` array:
```typescript
   const AUTHORIZED_EMAILS = [
     'stephen.cantoria@stjo.farm',
     'jolene.cantoria@stjo.farm',
     'newadmin@stjo.farm'  // Add here
   ];
```
3. Save and redeploy

---

## Files Modified

- ✅ `src/app/app.routes.ts` - Removed signup route, added hidden invite route
- ✅ `src/app/app.component.html` - Removed "Sign Up" navigation link
- ✅ `src/app/auth/admin-invite.guard.ts` - NEW: Guard for invite page
- ✅ `src/app/auth/invite-user/` - NEW: Hidden invite component
- ✅ `src/app/core/services/auth.service.ts` - Kept signUp() method intact

---

## Quick Access

**Invite Page URL (for admins only):**
```
https://farmanimaltracker.web.app/admin/invite-user
https://fat.stjo.farm/admin/invite-user
http://localhost:4200/admin/invite-user (development)
```

**Remember**: This page is hidden and only accessible to authorized admins!

---

*Last Updated: November 2024*
