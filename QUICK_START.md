# 🚀 Quick Start Guide - Testing User Roles & Features

## 🎯 Super Quick Role Testing (30 seconds)

### Step 1: Open `/src/app/App.tsx`

### Step 2: Find lines 86-92 (inside the `Nav` component)

### Step 3: Replace with one of these configurations:

---

## 🧪 Test Configurations (Copy & Paste)

### 👑 **Test as ADMIN** (Full Access)
```tsx
const isLoggedIn = true;
const currentUser = {
  name: "Admin User",
  role: "Admin",
  verified: true,
  designation: "System Administrator"
};
```
**You'll see**: Pink "ADMIN" badge + "Admin" button in nav → Click to access `/admin` panel

---

### ✅ **Test as CLUB MEMBER with Designation**
```tsx
const isLoggedIn = true;
const currentUser = {
  name: "Jane Smith",
  role: "Club Member",
  verified: true,
  designation: "President"
};
```
**You'll see**: Blue "CLUB MEMBER" badge in nav

---

### 🎓 **Test as TEACHER**
```tsx
const isLoggedIn = true;
const currentUser = {
  name: "Dr. Ram Kumar",
  role: "Teacher",
  verified: true,
  designation: "Faculty Advisor"
};
```
**You'll see**: Purple "TEACHER" badge in nav

---

### 🔹 **Test as REGULAR MEMBER** (No Verification)
```tsx
const isLoggedIn = true;
const currentUser = {
  name: "John Doe",
  role: "Member",
  verified: false,
  designation: null
};
```
**You'll see**: Gray "MEMBER" badge in nav

---

### 🚪 **Test LOGGED OUT State**
```tsx
const isLoggedIn = false;
const currentUser = {
  name: "Guest",
  role: "Member",
  verified: false
};
```
**You'll see**: "Login" button instead of Dashboard/badges

---

## 📍 Where to See the Changes

After changing the config above:

1. **Save the file** (`Ctrl+S` / `Cmd+S`)
2. **Browser auto-refreshes** (if using Vite/dev server)
3. **Look at navigation bar** (top right) to see your badge
4. **Mobile menu** (hamburger icon) shows badge at the top

---

## 🔍 Features to Test for Each Role

### As **ADMIN**:
- ✅ See pink "ADMIN" badge
- ✅ See "Admin" button in navbar
- ✅ Click "Admin" → Access `/admin` panel
- ✅ View all users in admin table
- ✅ See statistics cards
- ✅ Search users

### As **CLUB MEMBER**:
- ✅ See blue "CLUB MEMBER" badge with checkmark
- ✅ See designation below name in mobile menu
- ✅ Access dashboard

### As **TEACHER**:
- ✅ See purple "TEACHER" badge with graduation cap
- ✅ See designation below name in mobile menu
- ✅ Access dashboard

### As **REGULAR MEMBER**:
- ✅ See gray "MEMBER" badge
- ✅ Access dashboard
- ✅ No designation shown

### As **LOGGED OUT**:
- ✅ See "Login" button
- ✅ Click → Go to `/login` page
- ✅ See Google Sign-In option
- ✅ Toggle to `/register` page

---

## 🎨 Visual Reference

### Desktop Navigation (Logged In - Club Member):
```
[Logo] [Home] [About] [Events] [Projects] [Blog]  [✅ CLUB MEMBER] [Dashboard]
```

### Desktop Navigation (Logged In - Admin):
```
[Logo] [Home] [About] [Events] [Projects] [Blog]  [👑 ADMIN] [🛡️ Admin] [Dashboard]
```

### Mobile Menu (Logged In):
```
┌─────────────────────────────┐
│ [✅ CLUB MEMBER]            │
│ Jane Smith                  │
│ PRESIDENT                   │
├─────────────────────────────┤
│ 🏠 Home                     │
│ About                       │
│ Events                      │
│ Projects                    │
│ Blog                        │
│ [Dashboard Button]          │
└─────────────────────────────┘
```

---

## 🔗 Pages to Visit

### 1. **Homepage** (`/`)
- See your badge in nav
- Browse events and features

### 2. **Login Page** (`/login`)
- Test Google Sign-In button
- See email/password form
- Toggle to signup with link

### 3. **Signup Page** (`/register`)
- See name field (additional to login)
- Test form validation
- Toggle back to login

### 4. **Dashboard** (`/dashboard`)
- View your stats
- See announcements
- Check leaderboard

### 5. **Admin Panel** (`/admin`) - **ADMIN ONLY**
- Set role to "Admin" first
- Click "Admin" button in nav
- See user management table
- Search for users
- View statistics

### 6. **About Page** (`/about`)
- Scroll to bottom
- See "Connect With Us" section
- See 6 social media cards

### 7. **Footer** (any page)
- See social media icons
- Click logo to go home
- See Bisup sponsor credit

---

## 🎯 Common Test Scenarios

### **Scenario 1**: New User Signs Up
1. Set `isLoggedIn = false`
2. Go to `/register`
3. See Google Sign-In option
4. Click it → Mock redirect to dashboard
5. Now set `isLoggedIn = true` and `role: "Member"`
6. See gray MEMBER badge

### **Scenario 2**: Club President Logs In
1. Set `isLoggedIn = true`
2. Set `role: "Club Member"`, `verified: true`, `designation: "President"`
3. See blue CLUB MEMBER badge
4. Open mobile menu → see "PRESIDENT" under name

### **Scenario 3**: Admin Manages Users
1. Set `role: "Admin"`
2. Click "Admin" button in nav
3. Search for a user
4. See all user roles and badges
5. Click edit button (UI ready for API)

### **Scenario 4**: Teacher Checks Dashboard
1. Set `role: "Teacher"`, `verified: true`
2. See purple TEACHER badge
3. Access dashboard
4. See stats and events

---

## ⚡ Lightning Fast Testing

Want to test all roles quickly?

1. Open App.tsx
2. Keep the file open in your editor
3. Just change the `role` value
4. Save
5. Browser auto-refreshes
6. Repeat!

**Roles to try**: `"Member"`, `"Club Member"`, `"Teacher"`, `"Admin"`

---

## 💡 Pro Tips

1. **Desktop Badge**: Appears to the left of Dashboard button
2. **Mobile Badge**: Appears at the top of mobile menu
3. **Admin Access**: Only `role: "Admin"` shows the Admin button
4. **Designation**: Optional field, can be `null` or any string
5. **Verified**: Set to `true` for Club Members to show verified badge
6. **Name**: Changes what appears in mobile menu and admin panel

---

## 🐛 Troubleshooting

### "I don't see my badge!"
- ✅ Make sure `isLoggedIn = true`
- ✅ Check that you saved App.tsx
- ✅ Refresh browser
- ✅ Clear browser cache if needed

### "Admin button not showing"
- ✅ Make sure `role: "Admin"` (case-sensitive)
- ✅ Save the file
- ✅ Refresh browser

### "Badge color is wrong"
- ✅ Check spelling: "Member", "Club Member", "Teacher", "Admin" (exact)
- ✅ Make sure quotes are correct
- ✅ Refresh browser

---

## 📝 Example Full Configuration

Here's a complete example you can copy:

```tsx
function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { label: "Home", path: "/", icon: <Home size={14} /> },
    { label: "About", path: "/about" },
    { label: "Events", path: "/events" },
    { label: "Projects", path: "/projects" },
    { label: "Blog", path: "/blog" },
  ];

  // 🧪 CHANGE THIS TO TEST DIFFERENT ROLES
  const isLoggedIn = true; // Set to false to see logged-out state
  const currentUser = {
    name: "Jane Smith",                    // Your name
    role: "Club Member",                   // "Member", "Club Member", "Teacher", "Admin"
    verified: true,                        // true or false
    designation: "President"               // Any string or null
  };
  // 👆 CHANGE THESE VALUES TO TEST!

  return (
    // ... rest of Nav component
  );
}
```

---

## 🎉 You're Ready!

You can now test all user roles and features without any backend setup!

**Next**: When you're ready to connect to a real backend, check `/AUTH_SYSTEM_GUIDE.md` 🚀
