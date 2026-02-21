# 🚀 Quick Reference - Updated API

## 🔐 Authentication Endpoints

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test1234",      // Min 8 chars, uppercase, lowercase, number
  "college": "MIT",
  "year": 2,
  "skills": "React,Node.js"    // String or array
}

Response 201:
{
  "token": "access_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["React", "Node.js"],
    "profileComplete": false
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Test1234"
}

Response 200:
{
  "token": "access_token",
  "refreshToken": "refresh_token",
  "user": { ... }
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}

Response 200:
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response 200:
{
  "message": "Logged out successfully"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response 200:
{
  "id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "skills": [...],
  "profileComplete": true,
  ...
}
```

## 👤 User/Profile Endpoints

### Get My Profile
```http
GET /api/users/me
Authorization: Bearer <token>

Response 200:
{
  "id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "...",
  "college": "MIT",
  "year": 2,
  "skills": ["React", "Node.js"],
  "availability": "available",
  "github": "https://github.com/johndoe",
  "linkedin": "https://linkedin.com/in/johndoe",
  "profileComplete": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "bio": "Full-stack developer",
  "college": "MIT",
  "year": 3,
  "skills": ["React", "Node.js", "Python"],
  "github": "https://github.com/johndoe",
  "linkedin": "https://linkedin.com/in/johndoe",
  "availability": "available"
}

Response 200:
{
  // Updated user object
}
```

### Browse Users
```http
GET /api/users?page=1&limit=30&skill=React&availability=available
Authorization: Bearer <token>

Response 200:
{
  "users": [
    { "id": "...", "name": "...", ... }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 4
  }
}
```

### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>

Response 200:
{
  "id": "...",
  "name": "...",
  ...
}
```

## 🔒 Security Features

### Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes
- **General API**: 100 requests per 15 minutes

### Token Expiry
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Field Validation
- **Name**: 2-50 characters
- **Bio**: Max 500 characters
- **College**: Max 100 characters
- **Year**: 1-5
- **Skills**: Max 20 skills
- **Email**: Valid email format
- **GitHub/LinkedIn**: Valid URL format

## 📊 User Model Fields

```javascript
{
  name: String,              // Required, 2-50 chars
  email: String,             // Required, unique, valid email
  password: String,          // Required, min 8 chars (hashed)
  bio: String,               // Optional, max 500 chars
  college: String,           // Optional, max 100 chars
  year: Number,              // 1-5, default 1
  skills: [String],          // Max 20 skills
  availability: String,      // 'available' | 'busy' | 'in-team'
  github: String,            // Optional, valid GitHub URL
  linkedin: String,          // Optional, valid LinkedIn URL
  profileComplete: Boolean,  // Auto-calculated
  createdAt: Date,
  updatedAt: Date
}
```

## ⚠️ Error Responses

### Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Authentication Error
```json
{
  "error": "Invalid token"
}
```

### Rate Limit Error
```json
{
  "error": "Too many login attempts, please try again after 15 minutes"
}
```

### Not Found
```json
{
  "error": "User not found"
}
```

## 🎯 Profile Completion

Profile is considered complete when:
- ✅ Name is set
- ✅ At least one skill
- ✅ College is set
- ✅ Bio is set

Check: `user.profileComplete` (boolean)

## 🔄 Token Flow

```
1. Login/Register
   ↓
2. Receive access token (15min) + refresh token (7d)
   ↓
3. Use access token for API requests
   ↓
4. Access token expires (401 error)
   ↓
5. Call /api/auth/refresh with refresh token
   ↓
6. Receive new tokens
   ↓
7. Continue using API
```

## 📝 Quick Tips

1. **Always store both tokens** after login/register
2. **Implement auto-refresh** in your API client
3. **Handle validation errors** by field
4. **Check profileComplete** after auth
5. **Use pagination** for user lists
6. **Validate passwords** on frontend before submitting
7. **Handle rate limits** gracefully
8. **Clear tokens** on logout

## 🧪 Test Commands

```bash
# Start server
npm run dev

# Run auth tests
node test-auth.js

# Test with curl
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test1234"}'
```

---

**Base URL**: `http://localhost:5001/api`
**All authenticated endpoints require**: `Authorization: Bearer <token>` header
