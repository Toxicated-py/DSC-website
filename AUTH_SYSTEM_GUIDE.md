# Authentication & Admin System Guide

## ✅ What's Been Implemented

### 1. **New Login/Signup Pages** (`/login` and `/register`)
- ✨ **Google Sign-In** button with Google branding
- 🔄 Toggle between Login and Signup modes
- 📧 Email/password authentication
- 🎓 TU institutional email validation (@sms.tu.edu.np)
- 🎨 Neo-brutalist design matching the site aesthetic

### 2. **User Role System** (4 role types)

#### **Member** (Default)
- Badge: Gray with user icon
- Any logged-in user
- Access to: Dashboard, Events, Projects

#### **Club Member** (Verified)
- Badge: Blue with verified checkmark icon
- Verified club members
- Access to: Same as Member + special club features
- Can have designations (President, Vice President, Secretary, etc.)

#### **Teacher**
- Badge: Purple with graduation cap icon
- Faculty members
- Access to: Special teacher features
- Can have designations (Faculty Advisor, Head of Department, etc.)

#### **Admin**
- Badge: Pink with crown icon
- System administrators
- Access to: **Admin Panel** + all other features
- Full user management capabilities

### 3. **Admin Panel** (`/admin`)
Features:
- 👥 **User Management Tab**
  - Search users by name or email
  - View all users in a table
  - See user roles, badges, and verification status
  - Edit/Delete users (UI ready for backend integration)
  - Statistics cards (Total Users, Club Members, Teachers, Pending Verification)

- 📊 **Statistics Tab** (placeholder for analytics)
- ⚙️ **Settings Tab** (placeholder for admin settings)

### 4. **User Badges in Navigation**
- Badges appear next to user name in desktop navigation
- Mobile menu shows badge at the top with user info
- Admin users see an additional "Admin Panel" button

---

## 🧪 Testing the System

### Change User Role (for testing)
Edit `/src/app/App.tsx` around **line 87-92**:

```tsx
const currentUser = {
  name: "John Doe",
  role: "Admin", // Try: "Member", "Club Member", "Teacher", "Admin"
  verified: true,
  designation: "President" // Optional designation
};
```

### Test Different States
```tsx
// Logged out state
const isLoggedIn = false;

// Regular member
const currentUser = { name: "John", role: "Member", verified: false };

// Verified club member with designation
const currentUser = { 
  name: "Jane", 
  role: "Club Member", 
  verified: true, 
  designation: "President" 
};

// Teacher
const currentUser = { 
  name: "Dr. Kumar", 
  role: "Teacher", 
  verified: true, 
  designation: "Faculty Advisor" 
};

// Admin (gets Admin Panel access)
const currentUser = { 
  name: "Admin User", 
  role: "Admin", 
  verified: true 
};
```

---

## 🔌 Backend Integration Guide

### 1. **Google OAuth Setup**
```bash
npm install @react-oauth/google
```

In `AuthAndAdmin.tsx`, update `handleGoogleAuth`:
```tsx
const handleGoogleAuth = async () => {
  try {
    // Trigger Google OAuth
    const response = await googleLogin();
    // Send token to your backend
    const result = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: response.credential })
    });
    const data = await result.json();
    // Store JWT token
    localStorage.setItem('authToken', data.token);
    // Redirect to dashboard
    navigate("/dashboard");
  } catch (error) {
    console.error("Google auth failed:", error);
  }
};
```

### 2. **Regular Email/Password Auth**
Update `handleSubmit` in `AuthAndAdmin.tsx`:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      setError(data.message);
      return;
    }
    
    // Store JWT token
    localStorage.setItem('authToken', data.token);
    navigate("/dashboard");
  } catch (error) {
    setError("Authentication failed. Please try again.");
  }
};
```

### 3. **User Context (Recommended)**
Create `/src/contexts/AuthContext.tsx`:
```tsx
import React, { createContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  designation?: string;
}

export const AuthContext = createContext<{
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Fetch user data on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchUser(token);
    }
  }, []);
  
  const fetchUser = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      localStorage.removeItem('authToken');
    }
  };
  
  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    fetchUser(token);
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Then use in components:
```tsx
const { user, isLoggedIn } = useContext(AuthContext);
```

### 4. **Admin Panel API Integration**
In `AuthAndAdmin.tsx`, replace mock user data:
```tsx
const [users, setUsers] = useState([]);

useEffect(() => {
  fetchUsers();
}, []);

const fetchUsers = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  setUsers(data);
};

const updateUserRole = async (userId: string, newRole: string) => {
  const token = localStorage.getItem('authToken');
  await fetch(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: newRole })
  });
  fetchUsers(); // Refresh list
};
```

---

## 🎯 Backend API Endpoints Needed

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth callback
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Admin Panel
- `GET /api/admin/users` - List all users (admin only)
- `PATCH /api/admin/users/:id/role` - Update user role
- `PATCH /api/admin/users/:id/verify` - Verify user as club member
- `PATCH /api/admin/users/:id/designation` - Set user designation
- `DELETE /api/admin/users/:id` - Delete user

### User Roles & Permissions
Your backend should enforce:
- Only verified users can register for events
- Only club members can submit projects
- Only teachers can access teacher resources
- Only admins can access admin panel
- Role-based access control on all endpoints

---

## 📝 Database Schema Suggestion

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- null if Google OAuth only
  google_id VARCHAR(255), -- null if email/password only
  role VARCHAR(50) DEFAULT 'Member', -- Member, Club Member, Teacher, Admin
  verified BOOLEAN DEFAULT false,
  designation VARCHAR(100), -- President, Vice President, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

## 🔐 Security Best Practices

1. **Password Hashing**: Use bcrypt with salt rounds ≥ 10
2. **JWT Tokens**: Short expiry (15 min access, 7 day refresh)
3. **HTTP-Only Cookies**: For storing refresh tokens
4. **CORS**: Configure properly for your domain
5. **Rate Limiting**: Prevent brute force attacks
6. **Email Verification**: Send verification emails for new signups
7. **Role Validation**: Always check roles on backend, never trust frontend

---

## 🚀 Quick Start (Current Mock Setup)

1. **View logged-in state**: Already set to `true` in App.tsx
2. **Change role**: Edit `currentUser.role` in App.tsx (line 89)
3. **Access Admin Panel**: 
   - Set `role: "Admin"`
   - Click "Admin" button in navigation
   - Go to `/admin`
4. **Test Login/Signup**:
   - Go to `/login` or `/register`
   - Click "Sign In with Google" (mock, redirects to dashboard)
   - Or fill form and submit (mock, redirects to dashboard)

---

## 📦 Components Added

1. `/src/app/AuthAndAdmin.tsx` - New auth and admin components
2. Updated `/src/app/App.tsx` - Integrated badges and routing
3. `NewLoginPage` - Replaces old LoginPage
4. `AdminPanelPage` - New admin interface
5. `UserBadge` - Reusable badge component

---

## 🎨 Design Tokens Used

All components follow neo-brutalist design:
- **Member**: `bg-slate-400` (gray)
- **Club Member**: `bg-[#2563EB]` (blue)
- **Teacher**: `bg-[#7C3AED]` (purple)  
- **Admin**: `bg-[#FB7185]` (pink)
- **Borders**: `border-[#171717]` (black, 2px)
- **Shadows**: `brutal-shadow` and `brutal-shadow-lg`

---

Need help with implementation? Check the inline comments in the code! 🚀
