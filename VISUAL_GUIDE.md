# 🎨 Visual Guide - User Roles & Badges

## 👤 User Badge Types

### 1️⃣ Regular Member (Gray)
```
┌─────────────────────────┐
│  👤 MEMBER              │
│  Gray background        │
│  White text             │
└─────────────────────────┘
```
- **Who**: Any logged-in user
- **Access**: Basic features
- **Verified**: No

---

### 2️⃣ Club Member (Blue)
```
┌─────────────────────────┐
│  ✅ CLUB MEMBER         │
│  Blue background        │
│  White text             │
└─────────────────────────┘
```
- **Who**: Verified official members
- **Access**: Enhanced features
- **Verified**: Yes
- **Can have designation**: President, VP, Secretary, etc.

---

### 3️⃣ Teacher (Purple)
```
┌─────────────────────────┐
│  🎓 TEACHER             │
│  Purple background      │
│  White text             │
└─────────────────────────┘
```
- **Who**: Faculty members
- **Access**: Teacher resources
- **Verified**: Yes
- **Can have designation**: Faculty Advisor, HOD, etc.

---

### 4️⃣ Admin (Pink)
```
┌─────────────────────────┐
│  👑 ADMIN               │
│  Pink background        │
│  White text             │
└─────────────────────────┘
```
- **Who**: System administrators
- **Access**: Everything + Admin Panel
- **Verified**: Yes
- **Special**: Gets Admin button in nav

---

## 🖥️ Desktop Navigation Examples

### Regular Member
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [🗄️ Logo] Data Science Club                                                 │
│                                                                              │
│    [🏠 Home] [About] [Events] [Projects] [Blog]  [👤 MEMBER] [Dashboard]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Club Member with Designation
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [🗄️ Logo] Data Science Club                                                 │
│                                                                              │
│    [🏠 Home] [About] [Events] [Projects] [Blog]  [✅ CLUB MEMBER] [Dashboard]│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Teacher
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [🗄️ Logo] Data Science Club                                                 │
│                                                                              │
│    [🏠 Home] [About] [Events] [Projects] [Blog]  [🎓 TEACHER] [Dashboard]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Admin (Special: Shows Admin Button)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [🗄️ Logo] Data Science Club                                                 │
│                                                                              │
│  [🏠 Home] [About] [Events] [Blog]  [👑 ADMIN] [🛡️ Admin] [Dashboard]      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Logged Out
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [🗄️ Logo] Data Science Club                                                 │
│                                                                              │
│    [🏠 Home] [About] [Events] [Projects] [Blog]           [Login]           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile Menu Examples

### Club Member (Mobile)
```
┌──────────────────────────────┐
│ ☰ Menu                       │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ ✅ CLUB MEMBER           │ │
│ └──────────────────────────┘ │
│ Jane Smith                   │
│ PRESIDENT                    │
├──────────────────────────────┤
│ 🏠 Home                      │
│ About                        │
│ Events                       │
│ Projects                     │
│ Blog                         │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │     Dashboard            │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Admin (Mobile - Shows Admin Button)
```
┌──────────────────────────────┐
│ ☰ Menu                       │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ 👑 ADMIN                 │ │
│ └──────────────────────────┘ │
│ Admin User                   │
│ SYSTEM ADMINISTRATOR         │
├──────────────────────────────┤
│ 🏠 Home                      │
│ About                        │
│ Events                       │
│ Projects                     │
│ Blog                         │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │  🛡️ Admin Panel          │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │     Dashboard            │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

---

## 🔐 Login/Signup Page Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│                      DATA SCIENCE CLUB                                 │
├────────────────────────┬───────────────────────────────────────────────┤
│  LEFT PANEL            │  RIGHT PANEL                                  │
│  (Yellow Background)   │  (White Background)                           │
│                        │                                               │
│  WELCOME BACK         │   ┌─────────────────────────────────────┐    │
│  or JOIN US            │   │      SIGN IN / CREATE ACCOUNT       │    │
│                        │   └─────────────────────────────────────┘    │
│  Description text...   │                                               │
│                        │   Already have an account? [Sign In]          │
│  ┌──────────────────┐ │                                               │
│  │ Valid TU domain  │ │   ┌─────────────────────────────────────┐    │
│  │ required.        │ │   │ Full Name (signup only)             │    │
│  └──────────────────┘ │   │ [John Doe.....................]     │    │
│                        │   └─────────────────────────────────────┘    │
│  ✅ Member Dashboard   │                                               │
│  ✅ Event Registration │   ┌─────────────────────────────────────┐    │
│  ✅ Project Submission │   │ Institutional Email                 │    │
│                        │   │ [student@sms.tu.edu.np.........]   │    │
│                        │   └─────────────────────────────────────┘    │
│                        │                                               │
│                        │   ┌─────────────────────────────────────┐    │
│                        │   │ Password                            │    │
│                        │   │ [••••••••••••••••]                  │    │
│                        │   └─────────────────────────────────────┘    │
│                        │                                               │
│                        │   ┌─────────────────────────────────────┐    │
│                        │   │     CREATE ACCOUNT / SIGN IN        │    │
│                        │   └─────────────────────────────────────┘    │
│                        │                                               │
│                        │   ─────────────── Or ───────────────         │
│                        │                                               │
│                        │   ┌─────────────────────────────────────┐    │
│                        │   │ [G] SIGN IN WITH GOOGLE             │    │
│                        │   └─────────────────────────────────────┘    │
└────────────────────────┴───────────────────────────────────────────────┘
```

---

## 🛠️ Admin Panel Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🛡️ ADMIN ACCESS                                                            │
│  ADMIN PANEL                                                                │
│  Manage users, roles, and permissions                                      │
│                                                          [Back to Dashboard]│
├─────────────────────────────────────────────────────────────────────────────┤
│  [User Management] [Statistics] [Settings]                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔍 [Search users by name or email....................................]     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┬──────────┬──────────┬──────────┐                             │
│  │    7     │    4     │    2     │    1     │                             │
│  │  Total   │   Club   │ Teachers │ Pending  │                             │
│  │  Users   │ Members  │          │ Verify   │                             │
│  └──────────┴──────────┴──────────┴──────────┘                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  USER TABLE:                                                                │
│                                                                             │
│  USER           EMAIL                    ROLE          DESIGNATION  STATUS │
│  ┌──┐                                                                       │
│  │JD│ John      john@sms.tu.edu.np    👤 MEMBER       —            Pending │
│  └──┘                                                                       │
│  ┌──┐                                                                       │
│  │JS│ Jane      jane@sms.tu.edu.np    ✅ CLUB MEMBER President    ✅ Verified│
│  └──┘                                                                       │
│  ┌──┐                                                                       │
│  │RK│ Dr. Ram   ram@sms.tu.edu.np     🎓 TEACHER      Faculty      ✅ Verified│
│  └──┘                                  Advisor                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📄 Footer with Social Links

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌──┐ Data Science Club        About                  DATA SARATHI         │
│  │🗄️│                           Events                                      │
│  └──┘ School of Mathematical   Projects Gallery      © 2025 All rights     │
│       Sciences, TU             Blog                   reserved.             │
│                                Scanner Demo                                 │
│  [G] [in] [🐦] [f] [📸] [✉️]                         Domain & hosting by   │
│                                                        [Bisup]               │
└─────────────────────────────────────────────────────────────────────────────┘
```

Legend:
- [G] = GitHub (Black)
- [in] = LinkedIn (Blue)
- [🐦] = Twitter (Blue)
- [f] = Facebook (Blue)
- [📸] = Instagram (Pink)
- [✉️] = Email (Yellow)

---

## 🎯 About Page - Connect With Us Section

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONNECT WITH US                                                            │
│  Stay updated with our latest events, projects, and community highlights.  │
│                                                                             │
│  ┌───────────┬───────────┬───────────┬───────────┬───────────┬───────────┐ │
│  │  GitHub   │ LinkedIn  │  Twitter  │ Facebook  │ Instagram │   Email   │ │
│  │  (Black)  │  (Blue)   │  (Blue)   │  (Blue)   │  (Pink)   │ (Yellow)  │ │
│  │           │           │           │           │           │           │ │
│  │    🔗     │    🔗     │    🔗     │    🔗     │    🔗     │    ✉️     │ │
│  │           │           │           │           │           │           │ │
│  │  GITHUB   │ LINKEDIN  │  TWITTER  │ FACEBOOK  │ INSTAGRAM │   EMAIL   │ │
│  └───────────┴───────────┴───────────┴───────────┴───────────┴───────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

All cards have:
- Thick black borders (2px)
- Brutal shadow effect
- Hover: Card scales up slightly
- Click: Opens link in new tab

---

## 🎨 Design Tokens Reference

### Colors Used:
| Badge Type    | Background | Text  | Icon              |
|---------------|------------|-------|-------------------|
| Member        | `#9CA3AF` | White | 👤 User           |
| Club Member   | `#2563EB` | White | ✅ User Check     |
| Teacher       | `#7C3AED` | White | 🎓 Graduation Cap |
| Admin         | `#FB7185` | White | 👑 Crown          |

### Common Elements:
- **Border**: `#171717` (Black), 2px thick
- **Shadow**: `6px 6px 0px #171717`
- **Shadow (large)**: `12px 12px 0px #171717`
- **Background**: `#F4EFEB` (Beige)
- **Accent Yellow**: `#FFE800`

---

## 💡 Interaction States

### Badge Hover (Desktop)
```
Normal:  [✅ CLUB MEMBER]
Hover:   [✅ CLUB MEMBER]  (no interaction - just displays info)
```

### Button Hover
```
Normal:  ┌──────────┐
         │Dashboard │  Shadow: 6px
         └──────────┘

Hover:   ┌──────────┐
        │Dashboard │  Shadow: 2px (appears "pressed")
        └──────────┘
```

### Social Icon Hover
```
Normal:  ┌──┐
         │🔗│  White background
         └──┘

Hover:   ┌──┐
         │🔗│  Blue background, icon turns white
         └──┘
```

---

## 📊 User Flow Examples

### New User Journey:
```
1. Visit homepage (logged out)
   ↓
2. Click [Login] button
   ↓
3. Click "Sign Up" link → /register
   ↓
4. Fill form OR click "Sign In with Google"
   ↓
5. Redirected to /dashboard
   ↓
6. See gray "MEMBER" badge in nav
   ↓
7. Wait for admin verification → becomes "CLUB MEMBER"
```

### Admin Managing Users:
```
1. Login as admin
   ↓
2. See pink "ADMIN" badge + "Admin" button
   ↓
3. Click [Admin] → /admin
   ↓
4. Search for user
   ↓
5. Click [Edit] button
   ↓
6. Change role to "Club Member"
   ↓
7. Set designation to "Secretary"
   ↓
8. User now sees blue badge with designation
```

---

## 🖼️ Badge Size Reference

### Desktop Navigation:
- Badge height: `28px`
- Font size: `10px`
- Icon size: `10px`
- Padding: `8px horizontal, 4px vertical`

### Mobile Menu:
- Badge height: `32px`
- Font size: `10px`
- Icon size: `10px`
- Padding: `8px horizontal, 4px vertical`

### Admin Table:
- Badge height: `24px`
- Font size: `10px`
- Icon size: `10px`
- Padding: `6px horizontal, 3px vertical`

---

## ✨ Summary

All visual elements follow the **neo-brutalist design system**:
- ✅ Thick black borders everywhere
- ✅ Hard drop shadows (no blur)
- ✅ Bold uppercase typography
- ✅ High contrast colors
- ✅ Minimal rounded corners (sharp edges)
- ✅ Playful, energetic vibe

The user role system is **immediately visible** through color-coded badges that appear in:
- Desktop navigation
- Mobile menu
- Admin panel
- Future: User profiles, event registrations, project submissions

---

Ready to see it in action? Change your user role in `/src/app/App.tsx` and watch the magic happen! ✨
