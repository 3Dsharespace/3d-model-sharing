# 3Dsharespace 🚀

A full-stack 3D model sharing platform where users can upload, explore, and download free 3D assets. Built with modern web technologies and designed for creators, developers, and 3D enthusiasts.

## ✨ Features

### 🎨 **Frontend**
- **React 18** with modern hooks and functional components
- **Tailwind CSS** for beautiful, responsive design
- **Three.js/React Three Fiber** for 3D model viewing
- **Light & Dark Mode** toggle
- **Responsive Design** for all devices
- **Modern UI/UX** with smooth animations

### 🔧 **Backend**
- **Node.js/Express.js** REST API
- **PostgreSQL** database with **Prisma ORM**
- **AWS S3** integration for file storage
- **JWT Authentication** with role-based access
- **Rate Limiting** and security features
- **File Upload** with validation

### 🚀 **Core Functionality**
- **User Authentication** (signup, login, password reset)
- **3D Model Upload** with drag & drop
- **Model Discovery** with search and filters
- **Creator Profiles** with portfolios
- **Social Features** (likes, comments, follows)
- **Dashboard** with analytics and earnings
- **Free Downloads** for all users

## 🏗️ Architecture

```
3dsharespace/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── prisma/             # Database schema & migrations
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API calls
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm**
- **PostgreSQL** database
- **AWS S3** bucket (optional for development)

### 1. Clone & Install
```bash
git clone <repository-url>
cd 3dsharespace

# Install all dependencies
npm run install:all
```

### 2. Environment Setup
```bash
# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Start Development
```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:frontend    # Frontend on http://localhost:3000
npm run dev:backend     # Backend on http://localhost:5000
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/3dsharespace"

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# AWS S3 (optional for development)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

#### Frontend
The frontend automatically proxies API calls to the backend during development.

### Database Schema

The platform uses the following main entities:
- **Users** - Authentication and profiles
- **Models** - 3D assets with metadata
- **Comments** - User feedback on models
- **Likes** - User interactions
- **Downloads** - Usage tracking
- **Earnings** - Creator monetization

## 📱 Pages & Features

### 🏠 **Home Page**
- Hero section with search
- Featured models showcase
- Trending models
- Platform statistics
- Call-to-action sections

### 🔍 **Explore Page**
- Advanced search and filters
- Category browsing
- Grid/list view options
- Sorting and pagination

## 🚀 Production Deployment

### Quick Deploy

**Frontend (Vercel):**
```bash
npm run deploy:frontend
```

**Backend (Render/Cloud Run):**
```bash
npm run deploy:backend
```

### Docker Production
```bash
# Build production images
docker build -f backend/Dockerfile -t modelshare-backend ./backend
docker build -f frontend/Dockerfile -t modelshare-frontend ./frontend

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Detailed Deployment Guide
For comprehensive production setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

**Production Features:**
- ✅ CI/CD with GitHub Actions
- ✅ Automated testing and deployment
- ✅ Security headers and HTTPS
- ✅ Docker containerization
- ✅ Environment-specific configs
- ✅ Monitoring and logging setup

### 📊 **Model Detail Page**
- Large 3D model preview
- Download functionality
- User comments and likes
- Creator information
- Related models

### 👤 **Creator Profile**
- Portfolio showcase
- Statistics and earnings
- Follower system
- Contact information

### ⬆️ **Upload Page**
- Drag & drop file upload
- Metadata input forms
- Preview generation
- Category and tag selection

### 📈 **Dashboard**
- Upload management
- Analytics and insights
- Earnings tracking
- Account settings

## 🛡️ Security Features

- **JWT Authentication** with secure token handling
- **Role-based Access Control** (User, Creator, Admin)
- **Input Validation** and sanitization
- **Rate Limiting** to prevent abuse
- **File Type Validation** for uploads
- **CORS Protection** and security headers
- **SQL Injection Prevention** via Prisma ORM

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up AWS S3 or alternative storage
4. Configure CDN for static assets
5. Set up SSL/HTTPS

### Docker (Optional)
```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔮 Future Enhancements

- **AI-powered search** and recommendations
- **Advanced 3D viewer** with annotations
- **Collaborative features** and teams
- **Marketplace integration** for paid models
- **Real-time notifications** and chat
- **Mobile app** development
- **VR/AR support** for model viewing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js** community for 3D graphics
- **Prisma** team for excellent ORM
- **Tailwind CSS** for utility-first styling
- **React** team for the amazing framework

## 📞 Support

- **Documentation**: [Wiki/README]
- **Issues**: [GitHub Issues]
- **Discussions**: [GitHub Discussions]
- **Email**: support@3dsharespace.com

---

**Built with ❤️ by the 3Dsharespace Team**

*Empowering creators to share their 3D vision with the world.*
