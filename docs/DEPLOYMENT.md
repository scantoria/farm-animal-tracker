# Deployment Guide

Complete guide for building and deploying the Farm Animal Tracker (FAT App) to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Building for Production](#building-for-production)
4. [Firebase Setup](#firebase-setup)
5. [Deployment Process](#deployment-process)
6. [Custom Domain Setup](#custom-domain-setup)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Node.js**: Version 20.x or higher
- **npm**: Version 10.x or higher
- **Angular CLI**: Version 20.2.x
- **Firebase CLI**: Version 13.x or higher
- **Git**: For version control

### Install Angular CLI

```bash
npm install -g @angular/cli
```

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

---

## Environment Configuration

### Firebase Configuration

The app uses different environment files for development and production:

**Development:** `src/environments/environment.ts`
**Production:** `src/environments/environment.prod.ts` (if needed)

Current Firebase configuration:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyB2W0T_yXKwqiU-N0CdJdYVr4jmMWEdRgg",
    authDomain: "farmanimaltracker.firebaseapp.com",
    projectId: "farmanimaltracker",
    storageBucket: "farmanimaltracker.firebasestorage.app",
    messagingSenderId: "177150446042",
    appId: "1:177150446042:web:c6b05c712b3eb07a5f58e3",
    measurementId: "G-PKJEZHXRJG"
  }
};
```

**Security Note:** These credentials are safe for client-side use as they're protected by Firebase security rules.

---

## Building for Production

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Build the Application

```bash
npm run build
```

This command:
- Runs `ng build` with production configuration
- Outputs to `dist/farm-animal-tracker/browser/`
- Optimizes code with AOT compilation
- Minifies JavaScript and CSS
- Tree-shakes unused code
- Generates source maps (optional)

### Build Output

```
dist/farm-animal-tracker/
├── browser/
│   ├── index.html
│   ├── main-[hash].js
│   ├── polyfills-[hash].js
│   ├── styles-[hash].css
│   └── assets/
├── 3rdpartylicenses.txt
└── prerendered-routes.json
```

### Build Configuration

**File:** `angular.json`

```json
{
  "configurations": {
    "production": {
      "budgets": [
        {
          "type": "initial",
          "maximumWarning": "1.5MB",
          "maximumError": "2MB"
        },
        {
          "type": "anyComponentStyle",
          "maximumWarning": "6kB",
          "maximumError": "10kB"
        }
      ],
      "outputHashing": "all"
    }
  }
}
```

**Note:** Budgets were increased from default to accommodate current bundle size.

---

## Firebase Setup

### Step 1: Firebase Project

The app is already configured with Firebase project:
- **Project ID:** `farmanimaltracker`
- **Project Name:** FarmAnimalTracker

### Step 2: Firebase Configuration Files

Two files configure Firebase Hosting:

**firebase.json:**
```json
{
  "hosting": {
    "public": "dist/farm-animal-tracker/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(css|js)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

**.firebaserc:**
```json
{
  "projects": {
    "default": "farmanimaltracker"
  }
}
```

### Step 3: Firebase Authentication

Enable Email/Password authentication in Firebase Console:

1. Go to Firebase Console → Authentication
2. Click "Sign-in method" tab
3. Enable "Email/Password" provider
4. Save

### Step 4: Firestore Database

Create Firestore database:

1. Go to Firebase Console → Firestore Database
2. Click "Create database"
3. Choose production mode
4. Select location (us-central recommended)
5. Click "Enable"

### Step 5: Firestore Security Rules (Recommended)

**Current State:** Default rules (development mode)

**Recommended Production Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check authentication
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check tenant ownership
    function isOwner(tenantId) {
      return isAuthenticated() && request.auth.uid == tenantId;
    }

    // Animals collection
    match /animals/{animalId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.tenantId);

      // Subcollections under animals
      match /{subcollection}/{docId} {
        allow read, write: if isAuthenticated();
      }
    }

    // Farms collection
    match /farms/{farmId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.tenantId);
    }

    // Provider collections (blacksmiths, veterinarians, feedSuppliers)
    match /{collection}/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // Users collection
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

**To apply rules:**
1. Go to Firebase Console → Firestore Database
2. Click "Rules" tab
3. Paste the rules above
4. Click "Publish"

---

## Deployment Process

### Step 1: Login to Firebase

```bash
firebase login
```

This will:
- Open your browser
- Ask you to sign in with Google
- Authorize Firebase CLI
- Return to terminal when complete

**Verify login:**
```bash
firebase projects:list
```

You should see "farmanimaltracker" in the list.

### Step 2: Build Application

```bash
npm run build
```

Wait for build to complete successfully.

### Step 3: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

**Expected Output:**
```
=== Deploying to 'farmanimaltracker'...

i  deploying hosting
i  hosting[farmanimaltracker]: beginning deploy...
i  hosting[farmanimaltracker]: found 8 files in dist/farm-animal-tracker/browser
✔  hosting[farmanimaltracker]: file upload complete
i  hosting[farmanimaltracker]: finalizing version...
✔  hosting[farmanimaltracker]: version finalized
i  hosting[farmanimaltracker]: releasing new version...
✔  hosting[farmanimaltracker]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/farmanimaltracker/overview
Hosting URL: https://farmanimaltracker.web.app
```

### Step 4: Verify Deployment

Visit the Hosting URL to verify:
- **URL:** https://farmanimaltracker.web.app
- **Alternative:** https://farmanimaltracker.firebaseapp.com

**Test:**
1. Can you load the app?
2. Can you sign in?
3. Can you create/view data?

---

## Custom Domain Setup

### Current Custom Domain

**Domain:** `fat.stjo.farm`
**Status:** DNS propagation pending

### Step 1: Add Custom Domain in Firebase Console

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter: `fat.stjo.farm`
4. Click "Continue"

### Step 2: Get DNS Records

Firebase will display DNS records to add. Common options:

**Option A: A Records (Most Common)**
```
Type: A
Name: fat
Value: 151.101.1.195
TTL: 3600

Type: A
Name: fat
Value: 151.101.65.195
TTL: 3600
```

**Option B: CNAME Record**
```
Type: CNAME
Name: fat
Value: c.storage.googleapis.com
TTL: 3600
```

**Important:** Firebase will show you the exact records - use those, not the examples above.

### Step 3: Add DNS Records in GoDaddy

1. Go to https://dcc.godaddy.com/
2. Find domain `stjo.farm`
3. Click "DNS" → "Manage DNS"
4. Scroll to "DNS Records"
5. Click "Add" for each A record:
   - Type: A
   - Name: fat
   - Value: [IP from Firebase]
   - TTL: 1 hour
6. Save each record

### Step 4: Verify Domain

Back in Firebase Console:
1. Click "Verify"
2. Wait for verification (can take up to 24 hours)
3. Firebase will automatically provision SSL certificate
4. Domain status will change to "Connected"

### DNS Propagation

**Check propagation status:**
```bash
nslookup fat.stjo.farm
```

or use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

**Timeline:**
- Minimum: 15 minutes
- Typical: 1-2 hours
- Maximum: 24-48 hours

### SSL Certificate

Firebase automatically provisions SSL certificates:
- Uses Let's Encrypt
- Automatic renewal
- HTTPS enforced
- No configuration needed

---

## Post-Deployment

### Verify Functionality

Test all major features:
- ✅ User authentication (login/signup)
- ✅ Animal CRUD operations
- ✅ Health records
- ✅ Breeding events
- ✅ Farm management
- ✅ Provider management
- ✅ Mobile responsiveness

### Monitor Performance

**Firebase Console:**
- Hosting → Usage
- Firestore → Usage
- Authentication → Users

**Key Metrics:**
- Page load time
- Request count
- Data transfer
- Active users

### Enable Analytics (Optional)

Firebase Analytics is already configured:
- **Measurement ID:** G-PKJEZHXRJG
- Tracks page views
- Tracks user interactions

**To view:**
Firebase Console → Analytics

---

## Continuous Deployment

### Manual Deployment Workflow

1. Make code changes
2. Test locally: `npm start`
3. Build: `npm run build`
4. Deploy: `firebase deploy --only hosting`

### Automated Deployment (Future)

Set up GitHub Actions for automatic deployment:

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: farmanimaltracker
```

---

## Troubleshooting

### Build Errors

**Problem:** Bundle size exceeds budget

**Solution:**
1. Check `angular.json` budget limits
2. Increase if necessary
3. Or optimize bundle:
   - Remove unused dependencies
   - Lazy load modules
   - Optimize images

**Problem:** TypeScript compilation errors

**Solution:**
1. Run `npm install` to ensure dependencies are current
2. Check for TypeScript errors: `ng build`
3. Fix errors shown in console

### Deployment Errors

**Problem:** "Not authenticated" error

**Solution:**
```bash
firebase logout
firebase login
firebase deploy --only hosting
```

**Problem:** "Permission denied" error

**Solution:**
- Verify you have Owner or Editor role in Firebase project
- Check Firebase Console → Project Settings → Users and permissions

**Problem:** Files not uploading

**Solution:**
1. Ensure build completed: check `dist/farm-animal-tracker/browser` exists
2. Verify `firebase.json` points to correct directory
3. Try: `firebase deploy --only hosting --debug`

### Runtime Errors

**Problem:** App shows blank page

**Solution:**
1. Check browser console for errors
2. Verify Firebase config is correct
3. Check network tab for failed requests

**Problem:** Authentication not working

**Solution:**
1. Verify Firebase Authentication is enabled
2. Check authorized domains in Firebase Console
3. Add custom domain to authorized domains

**Problem:** Data not loading

**Solution:**
1. Check Firestore security rules
2. Verify user is authenticated
3. Check browser console for Firestore errors

### Custom Domain Issues

**Problem:** Domain not resolving

**Solution:**
1. Verify DNS records in GoDaddy
2. Wait for DNS propagation (up to 48 hours)
3. Use `nslookup` or `dig` to verify
4. Clear browser DNS cache

**Problem:** SSL certificate pending

**Solution:**
- Wait up to 24 hours for certificate provisioning
- Verify DNS is resolving correctly
- Check Firebase Console for status updates

---

## Rollback Procedure

If deployment has issues, you can rollback:

### Firebase Hosting Versions

1. Go to Firebase Console → Hosting
2. Click on "Release history"
3. Find previous version
4. Click "⋮" → "Rollback"

### Manual Rollback

1. Checkout previous Git commit
2. Build: `npm run build`
3. Deploy: `firebase deploy --only hosting`

---

## Best Practices

### Before Deployment

- ✅ Test all features locally
- ✅ Run build to check for errors
- ✅ Review code changes
- ✅ Update version number
- ✅ Create Git tag for release

### During Deployment

- ✅ Deploy during low-traffic hours
- ✅ Monitor deployment progress
- ✅ Verify immediately after deployment
- ✅ Keep previous version available for rollback

### After Deployment

- ✅ Test all critical features
- ✅ Monitor error logs
- ✅ Check performance metrics
- ✅ Inform users of new features
- ✅ Document changes

---

## Deployment Checklist

### Pre-Deployment
- [ ] All features tested locally
- [ ] No console errors
- [ ] Build completes successfully
- [ ] Git committed and pushed
- [ ] Release notes prepared

### Deployment
- [ ] Logged into Firebase CLI
- [ ] Build completed
- [ ] Deployment successful
- [ ] URLs accessible

### Post-Deployment
- [ ] Login works
- [ ] All CRUD operations work
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Custom domain working (if applicable)
- [ ] SSL certificate active

---

## Support

For deployment issues:
- **Email:** stephen.cantoria@thisbyte.com
- **Firebase Console:** https://console.firebase.google.com/project/farmanimaltracker

---

**Last Updated:** November 2024
**Version:** 1.0.0 (MVP)
**Deployment Date:** November 1, 2024
**Current Status:** ✅ Live at https://farmanimaltracker.web.app
