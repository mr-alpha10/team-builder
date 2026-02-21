# 🚀 TeamBuilder

A platform for students to find teammates for hackathons, projects, and collaborations. Built with MERN stack and Google OAuth.

## ✨ Features

- **Authentication**: Email/Password and Google OAuth
- **Profile Management**: Skills, interests, experience level, college info
- **Project Creation**: Create and manage team projects
- **Team Matching**: Find teammates based on skills and interests
- **AI Agent**: Get project suggestions and team recommendations
- **Real-time Messaging**: Communicate with potential teammates

## 🛠️ Tech Stack

**Frontend:**
- React + Vite
- React Router
- Axios
- Google OAuth (@react-oauth/google)

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Google Auth Library
- bcryptjs for password hashing

**AI:**
- Groq API integration

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd team-builder
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

### Environment Variables

**Backend (.env):**
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GROQ_API_KEY=your_groq_api_key
```

**Frontend (.env):**
```env
VITE_PORT=3000
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📚 Documentation

- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md) - Setup Google OAuth
- [Changelog](./CHANGELOG.md) - Recent updates and fixes

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password strength validation (8+ chars, uppercase, lowercase, number)
- XSS protection on user inputs
- Rate limiting on auth endpoints
- Secure Google OAuth integration
- Cascade delete for account removal

## 📱 Mobile App

React Native mobile app available in `/mobile` directory (work in progress).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Your Team Name

## 🙏 Acknowledgments

- Google OAuth for authentication
- Groq for AI capabilities
- MongoDB Atlas for database hosting
