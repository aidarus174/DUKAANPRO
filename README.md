# DukaanPro — Shop Management System

This is the **DukaanPro** production-oriented web-app foundation using React/Vite + Firebase Authentication, Firestore, Storage, security rules, PWA assets and offline Firestore persistence.

## Important: why the old blank screen happened
The previous build initialized Firebase immediately even when the required `VITE_FIREBASE_*` environment variables were missing. That could throw before React rendered, producing a blank page.

This build is hardened: **if Firebase is not configured, DukaanPro still renders normally and Try Demo works**. Real authentication/data operations require a Firebase Web App configuration.

## Run locally

1. Copy `.env.example` to `.env`.
2. Fill the Firebase Web App values.
3. Install dependencies: `npm install`
4. Start: `npm run dev`
5. Build: `npm run build`

## Firebase setup

Enable:
- Authentication: Email/Password and Google
- Firestore Database
- Storage

Deploy the included `firestore.rules` and `storage.rules` after reviewing them for your Firebase project.

## Do not open the Vite project by double-clicking `index.html`
Use `npm run dev` or deploy the built `dist/` directory to HTTPS hosting. Service workers, Firebase auth flows and some browser APIs are restricted when a web app is opened as a local `file:`/`content:` document.

## Demo
Try Demo uses in-memory isolated sample data. It never writes to Firestore and never modifies a real account.

## Branding
Main product name: **DUKAANPRO**
Browser title: **DukaanPro — Shop Management System**
