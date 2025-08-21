# JobPortal Pro - Combined Frontend

This is a combined frontend application that merges the beautiful UI design from `job-portal(1)` with the OAuth functionality and backend integration from the original `frontend` project.

## Features

### Design & UI (from job-portal(1))
- ✨ Beautiful modern design with Tailwind CSS
- 🎨 Gradient backgrounds and glass-morphism effects
- 🌙 Dark/Light mode toggle
- 📱 Responsive design
- 🎯 shadcn/ui components for consistent styling
- ✨ Smooth animations and transitions

### Functionality (from frontend)
- 🔐 Auth0 OAuth integration
- 👤 User role management (Job Seeker, Company, Admin)
- 🔒 Protected routes based on user roles
- 🏢 Company profile management
- 📊 Context-based state management
- 🔄 Dynamic routing with React Router

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Auth0** - Authentication
- **React Router DOM** - Routing
- **Lucide React** - Icons
- **Axios** - HTTP client

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── job-seeker-dashboard.jsx
│   ├── admin-dashboard.jsx
│   ├── CompanyDashboard.jsx
│   ├── Navbar.jsx
│   └── ...
├── context/
│   ├── AuthMetaContext.jsx
│   └── ThemeContext.jsx
├── pages/
│   └── BrowseJobs.jsx
├── lib/
│   └── utils.js
├── hooks/
│   └── use-toast.js
└── App.jsx
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Auth0:**
   - Update the Auth0 domain and client ID in `src/main.jsx`
   - Make sure your Auth0 application is configured for your domain

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Key Components

### Landing Page
- Beautiful hero section with animated backgrounds
- Professional gradient typography
- Stats display with modern cards
- Call-to-action buttons

### Role Selection
- Interactive role cards (Job Seeker, Company, Admin)
- Hover animations and transitions
- Feature lists for each role

### Dashboards
- **Job Seeker Dashboard**: Job recommendations, application tracking
- **Company Dashboard**: Job management, candidate analytics
- **Admin Dashboard**: System overview, user management

### Authentication Flow
1. User visits landing page
2. Clicks "Get Started" → Auth0 login
3. After login → Role selection screen
4. Role selected → Appropriate dashboard

## Environment Setup

Make sure your backend is running on `http://localhost:5000` and has the following endpoints:
- `POST /api/auth/assign-role` - Assign role to user
- `GET /api/auth/me` - Get user metadata

## Design Philosophy

This project combines:
- **Modern aesthetics** with gradients, blur effects, and smooth animations
- **Professional functionality** with role-based access and secure authentication
- **Responsive design** that works on all device sizes
- **Accessible UI** with proper contrast and keyboard navigation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

The project structure follows modern React patterns:
- Use functional components with hooks
- Context for global state management
- Protected routes for security
- Component composition for reusability

## License

This project combines elements from both source projects and inherits their respective licensing terms.
