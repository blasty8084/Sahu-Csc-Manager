# Replit Agent 4 Prompt — Page Refresh Route Fix

## Problem
When user refreshes any page (Ledger, AePS, Profile, Udhari Khata etc.),
app redirects back to dashboard instead of staying on the current page.

## Expected Behavior
Refresh on Ledger → stay on Ledger
Refresh on AePS → stay on AePS
Refresh on Profile → stay on Profile
Refresh on any page → stay on that page

---

## Root Cause
Either:
1. Auth check on page load redirects to dashboard before checking current route
2. Session check fails momentarily and uses dashboard as fallback
3. ProtectedRoute redirects during auth loading state

---

## 1. Fix Auth Check — Don't Always Go to Dashboard

```typescript
// ❌ WRONG — always goes to dashboard
if (isAuthenticated) navigate('/dashboard');

// ✅ CORRECT — stay on current URL
if (isAuthenticated) {
  const publicRoutes = ['/login', '/register', '/forgot-password', '/'];
  if (publicRoutes.includes(location.pathname)) {
    navigate('/dashboard');
  }
  // Already on correct page — do nothing
}
```

---

## 2. Save Last Visited Route

In `App.tsx` or `Layout.tsx`:

```typescript
import { useLocation } from 'react-router-dom';

const location = useLocation();

useEffect(() => {
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  if (!publicRoutes.includes(location.pathname)) {
    sessionStorage.setItem('lastRoute', location.pathname);
  }
}, [location.pathname]);
```

---

## 3. Restore Last Route on App Load

```typescript
const restoreRoute = () => {
  const lastRoute = sessionStorage.getItem('lastRoute');
  const currentPath = window.location.pathname;
  const publicRoutes = ['/login', '/register', '/forgot-password', '/'];

  if (isAuthenticated) {
    if (publicRoutes.includes(currentPath)) {
      navigate(lastRoute ?? '/dashboard');
    }
    // Already on correct page — do nothing, stay here
  } else {
    if (!publicRoutes.includes(currentPath)) {
      sessionStorage.setItem('lastRoute', currentPath);
    }
    navigate('/login');
  }
};
```

---

## 4. Loading State — Prevent Flash Redirect

```typescript
const [authLoading, setAuthLoading] = useState(true);

useEffect(() => {
  checkSession()
    .then((user) => { setUser(user); })
    .catch(() => { setUser(null); })
    .finally(() => {
      setAuthLoading(false); // Only redirect after check completes
    });
}, []);

// In router — show splash screen during auth check
if (authLoading) return <SplashScreen />;
// Never redirect during loading
```

---

## 5. Protected Route Fix

```typescript
function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  // Wait for auth check to complete — never redirect during loading
  if (authLoading) return <SplashScreen />;

  // Not logged in — save current path, go to login
  if (!user) {
    sessionStorage.setItem('lastRoute', location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Logged in — show page as-is
  return children;
}
```

---

## 6. After Login — Restore Saved Route

```typescript
const handleLoginSuccess = () => {
  const lastRoute = sessionStorage.getItem('lastRoute');
  const publicRoutes = ['/login', '/register', '/forgot-password'];

  if (lastRoute && !publicRoutes.includes(lastRoute)) {
    sessionStorage.removeItem('lastRoute');
    navigate(lastRoute); // Go back to where user was
  } else {
    navigate('/dashboard'); // Default
  }
};
```

---

## 7. PWA Deep Link Fix

Ensure Express serves `index.html` for all non-API routes:

```typescript
// In api-server/src/index.ts
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../sahu-csc/dist/index.html'));
  }
});
```

Vite dev server config:

```typescript
// vite.config.ts
server: {
  historyApiFallback: true,
}
```

---

## 8. React Query Cache — Keep Data on Refresh

```typescript
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

persistQueryClient({
  queryClient,
  persister: createSyncStoragePersister({
    storage: window.sessionStorage,
  }),
  maxAge: 30 * 60 * 1000, // 30 minutes
});
```

---

## 9. Test Checklist After Fix

| Test Case | Expected Result |
|---|---|
| Login → Ledger → refresh | Stay on Ledger ✅ |
| Login → AePS → refresh | Stay on AePS ✅ |
| Login → Profile → refresh | Stay on Profile ✅ |
| Login → Udhari Khata → refresh | Stay on Udhari Khata ✅ |
| Login → Dashboard → refresh | Stay on Dashboard ✅ |
| Not logged in → visit /ledger | Redirect to login → after login go back to /ledger ✅ |
| Logout → refresh | Redirect to login ✅ |

---

## Do Not Change

- Any existing UI design or branding
- Any existing API endpoints or business logic
- Any existing database schema
- Any existing auth flow logic (only fix the redirect behavior)

---

*SAHU CSC Manager | blasty8084 | July 2026*
