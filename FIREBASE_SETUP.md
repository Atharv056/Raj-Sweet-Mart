# Firebase Setup Guide for Raj Sweet Mart

## Why Firebase?
Firebase Realtime Database allows all orders to be stored in a shared cloud database. Now:
- Customers can order from any device
- Admin can see ALL orders from any device
- Orders are synced in real-time across all devices

## Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Create a project"**
3. Enter project name: `raj-sweet-mart` (or your choice)
4. Click **Continue**
5. Disable Google Analytics (optional) and click **Create project**
6. Wait for the project to be created (1-2 minutes)

## Step 2: Create a Realtime Database

1. In Firebase Console, click **Build** (left menu)
2. Click **Realtime Database**
3. Click **Create Database**
4. Select region closest to you (e.g., `Asia (Singapore)`)
5. Choose **Start in Test Mode** (for now - orders visible without authentication)
6. Click **Enable**
7. Wait for database to be created

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon ⚙️ top left)
2. Click **"Your apps"** section
3. Click **"</>‎ Web"** icon to add a web app
4. App nickname: `Raj Sweet Mart Web`
5. Click **Register app**
6. Copy the config object that appears - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "xxxxxxxxxx",
  appId: "1:xxxxxxxxxx:web:xxxxxxxxxxxxxxxx"
};
```

## Step 4: Update Firebase Config in Your Project

1. Open `js/firebase-config.js` in your editor
2. Replace the config object with your Firebase config from Step 3
3. Save the file

**Example:**
```javascript
// YOUR ACTUAL CONFIG (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyD1234567890abcdefghijklmnop",
  authDomain: "raj-sweet-mart.firebaseapp.com",
  databaseURL: "https://raj-sweet-mart-default-rtdb.firebaseio.com",
  projectId: "raj-sweet-mart",
  storageBucket: "raj-sweet-mart.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890ab"
};
```

4.1 Add the Firebase SDK scripts and your config file to any HTML page that
uses order functionality (order.html, admin.html, user-dashboard.html, etc.)
Place them **before** your own JavaScript files so that `firebase` is
available when your code runs. Example:

```html
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js"></script>
<script src="/js/firebase-config.js"></script>
```

## Step 5: Test Your Setup

1. Open your website in a browser
2. Go to **Order Now** page
3. Add items to cart and submit an order
4. Go to **Admin** panel
5. You should see the order appear in real-time!

## Troubleshooting

### "Cannot connect to Firebase" error
- Check that you copied the config correctly in `js/firebase-config.js`
- Make sure the config has all 7 fields
- Check Firebase Console that Realtime Database is **Enabled**

### Orders not saving
- Open browser console (F12 → Console tab)
- Check for errors with detailed info
- Make sure Firebase config is in the correct file

### Database Rules Issues (if you add authentication later)
- Go to Firebase Console → Realtime Database → **Rules** tab
- For development, use:
```json
{
  "rules": {
    "orders": {
      ".read": true,
      ".write": true
    }
  }
}
```
- Click **Publish**

## Important Security Note

In production, you should:
1. Enable Firebase Authentication
2. Set proper database rules so only authenticated users can submit orders
3. Restrict admin access
4. Store payment screenshots securely

For now, Test Mode allows anyone to read/write, which is fine for development.

## What Changed in Your Code

- `checkout.js`: Now saves orders to Firebase instead of localStorage
- `admin.js`: Now reads orders from Firebase in real-time
- Both pages automatically sync with the cloud database

## Testing on Different Devices

1. **Same Wi-Fi Network**: Open your local server on different laptops/phones
2. **Different Networks**: Deploy to a hosting service (Netlify, Vercel, etc.)
3. Orders will appear on all devices in real-time!

---

**Need Help?**
- Firebase Docs: https://firebase.google.com/docs/database
- Check browser console for detailed error messages (F12)
