# User Authentication Flow Documentation

## Overview
A complete, modern authentication system connecting your React frontend to the PHP backend with token-based authentication, session management, and secure state persistence.

## Components & Services

### 1. **AuthContext** (`services/authContext.tsx`)
Central authentication state management using React Context API.

**Features:**
- User login/logout management
- JWT token handling and storage
- Session persistence via localStorage
- Global auth state available via `useAuth()` hook

**Key Functions:**
```typescript
const { currentUser, isAuthenticated, login, logout, updateUser, authToken } = useAuth();

// Login with name and PIN
await login('John Doe', '1234');

// Logout
logout();

// Update user info
updateUser(updatedUser);
```

### 2. **AuthGuard** (`components/AuthGuard.tsx`)
Route protection component that requires authentication.

**Usage:**
```typescript
<AuthGuard fallback={<Login />}>
  <ProtectedComponent />
</AuthGuard>
```

### 3. **Login Component** (`views/Login.tsx`)
Complete login UI with:
- User selection
- PIN entry (4-digit numeric pad)
- Two-factor authentication support
- API integration for user retrieval
- Fallback to mock data if API unavailable

**Features:**
- Loads users from PHP API endpoint
- Validates credentials against backend
- Manages authentication tokens
- Supports 2FA via TOTP

### 4. **Auth Utilities** (`services/authUtils.ts`)
Helper functions for session management:

```typescript
// Check if token is valid and not expired
isTokenValid(): boolean

// Get remaining session time in milliseconds  
getSessionTimeRemaining(): number

// Format remaining time for display
formatSessionTimeRemaining(): string // "5h 30m remaining"

// Refresh/extend the session
await refreshSession(): Promise<boolean>

// Hook for automatic session timeout monitoring
useSessionTimeout()
```

### 5. **API Service** (`services/apiService.ts`)
Provides all backend endpoints with automatic token management:

```typescript
// Authentication
await login({ name: string, pin: string }): Promise<LoginResponse>

// Token management
setAuthToken(token: string)
getAuthToken(): string | null
clearAuthToken()

// All other CRUD operations automatically include auth token
```

## Authentication Flow

### Login Process
1. User selects their role from the login screen
2. User enters 4-digit PIN
3. Frontend calls `login()` API with name and PIN
4. PHP backend validates credentials and returns JWT token
5. Token stored in localStorage with expiration time
6. User object stored in localStorage
7. App navigates to authenticated content

### Session Management
- Auth token stored with 24-hour expiration
- Session checked every minute for expiration
- Auto-logout on token expiration
- User warned 30 minutes before expiration
- Session can be refreshed via `refreshSession()`

### Route Protection
```typescript
const App = () => {
  return (
    <AuthProvider>
      <AuthGuard fallback={<Login />}>
        <AppContent />
      </AuthGuard>
    </AuthProvider>
  );
};
```

## localStorage Keys

| Key | Purpose | Content |
|-----|---------|---------|
| `fuel_fleet_auth_token` | JWT authentication token | `string` |
| `fuel_fleet_auth_expires` | Token expiration timestamp | ISO string |
| `fuel_fleet_user` | Logged-in user data | User JSON object |
| `fuel_fleet_users` | Cached user list | User[] JSON array |

## Token Usage

Tokens are automatically added to all API requests:
```
Authorization: Bearer <token>
```

Or via query parameter:
```
?token=<token>
```

## Session Timeout Events

Two custom events are dispatched:

```typescript
// When session is about to expire (30 min before)
window.addEventListener('auth:sessionWarning', (e) => {
  const { timeLeft } = e.detail;
  console.log(`Session expires in ${timeLeft}ms`);
});

// When auth state changes
window.addEventListener('auth:changed', () => {
  console.log('Auth state updated');
});
```

## Error Handling

Login errors are caught and displayed:
```typescript
try {
  await login(username, pin);
} catch (error) {
  // Error message shows in UI
  // Token cleared, user logged out
}
```

## Two-Factor Authentication

If 2FA is enabled on user account:
1. PIN validation passes
2. User prompted for 6-digit TOTP code
3. Code verified against user's secret
4. Login completed on success

## Integration with Components

### In any component:
```typescript
import { useAuth } from '@services/authContext';

const MyComponent = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return <div>Welcome, {currentUser.name}!</div>;
};
```

### Check session time remaining:
```typescript
import { useSessionTimeout, formatSessionTimeRemaining } from '@services/authUtils';

const SessionMonitor = () => {
  useSessionTimeout(); // Auto-logout on expiration
  
  return (
    <div>Session: {formatSessionTimeRemaining()}</div>
  );
};
```

## API Endpoints Used

- `POST /api.php?action=login` - Authenticate user
- `GET /api.php?action=list_users` - Get available users
- All other endpoints automatically include auth token

## Security Notes

1. **Token Storage**: Tokens stored in localStorage (consider using secure HttpOnly cookies for production)
2. **PIN Handling**: Pins transmitted over HTTPS in production only
3. **Token Expiration**: 24-hour expiration configurable in `authContext.tsx`
4. **Auto-Logout**: On token expiration or server rejection
5. **2FA Support**: TOTP-based two-factor authentication ready

## Future Enhancements

- [ ] Refresh token mechanism for extended sessions
- [ ] Remember device option
- [ ] Biometric authentication
- [ ] Role-based access control (RBAC)
- [ ] Audit logging for all auth events
- [ ] Multi-session management
- [ ] Password reset flow
- [ ] Social login integration
