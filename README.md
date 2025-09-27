# Vanilla TypeScript SPA Social Media Platform

A modern, responsive social media platform built with TypeScript, Vite, ES2025 features and the Noroff Social API. It demonstrates best practices for consuming authenticated APIs, performing CRUD operations, and leveraging the latest advancements in the JavaScript ecosystem.

## Project Assets

- [Production deploy]()
- [Github Repository](https://github.com/03-renate/social_platform)
- [API URL](https://v2.api.noroff.dev/social/posts)

## Login Details

- **Email** - h-s-r@stud.noroff.no
- **Password** - Noroff@123

## Features

### Authentication System

- **User Registration** - Create new accounts with @stud.noroff.no email validation
- **Secure Login** - JWT token-based authentication
- **Form Validation** - Client-side validation with helpful error messages
- **Loading States** - Visual feedback during authentication processes
- **Auto-redirect** - Smart navigation based on authentication status

### Feed & Posts

- **Interactive Post Cards** - Click anywhere on a post to view full details
- **Real-time Search** - Search posts, users, and hashtags with live results
- **Pagination System** - Navigate through posts with Previous/Next controls
- **Responsive Grid Layout** - Optimized for all device sizes
- **Sample Posts** - Demo content for unauthenticated users

### Post Interactions

- **Like/Reactions** - Multiple reaction types with hover modal
- **Comments System** - View and create comments with real-time updates
- **Share Functionality** - Native share API with clipboard fallback
- **Media Support** - Image display with responsive design
- **Tag System** - Hashtag support with visual indicators

### 🔍 Single Post View

- **Full Post Display** - Complete post details with author information
- **Comments Integration** - Load and display comments on-demand
- **Interactive Elements** - All standard post interactions available
- **Responsive Design** - Optimized single post layout

### 🧭 Navigation & UX

- **Client-side Routing** - Fast navigation with history management
- **Responsive Navbar** - Mobile-friendly navigation with search
- **Creative 404 Page** - Space-themed not found page with animations
- **Loading Screens** - Smooth loading states throughout the app
- **Error Handling** - Comprehensive error states with recovery options

## Tech Stack

- **Frontend Framework:** TypeScript + Vite
- **Styling:** CSS3 with Custom Properties
- **API:** Noroff Social API v2
- **Authentication:** JWT Tokens with Local Storage
- **Routing:** Custom client-side router
- **Testing:** Vitest
- **Code Formatting:** Prettier

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- @stud.noroff.no email address for registration

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd social_platform-1
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. ** Open your browser**
   - Navigate to `http://localhost:5173`
   - Register with your @stud.noroff.no email
   - Start exploring the platform!

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   └── postCard.ts      # Interactive post card component
├── pages/               # Page components
│   ├── FeedPage.ts     # Main feed with posts and search
│   ├── LogInPage.ts    # Authentication login
│   ├── RegisterPage.ts # User registration
│   ├── singlePage.ts   # Individual post view
│   ├── ProfilePage.ts  # User profile
│   ├── NavbarPage.ts   # Navigation component
│   └── NotFoundPage.ts # 404 error page
├── services/           # API and business logic
│   ├── api/
│   │   └── client.ts   # HTTP client with auth
│   ├── auth/
│   │   └── checkAuth.ts # Authentication utilities
│   ├── posts/
│   │   └── posts.ts    # Posts API integration
│   ├── interactions/
│   │   └── interactions.ts # Comments & reactions
│   └── error/
│       └── error.ts    # Error handling
├── router/
│   └── index.ts        # Client-side routing
├── types/
│   └── index.ts        # TypeScript definitions
├── utils/              # Helper functions
│   ├── auth.ts         # Authentication helpers
│   ├── storage.ts      # Local storage utilities
│   ├── ui.ts           # UI helper functions
│   └── validators.ts   # Form validation
├── constant.ts         # App constants
├── main.ts            # Application entry point
└── style.css          # Global styles
```

## Key Features Walkthrough

### Authentication Flow

1. **Landing Page** - Login form with validation
2. **Registration** - Create account with bio option
3. **Auto-login** - Seamless authentication with token storage
4. **Protected Routes** - Automatic redirects for authenticated users

### Feed Experience

1. **Post Grid** - Responsive card layout with hover effects
2. **Search Integration** - Real-time search from navbar
3. **Pagination** - Smooth navigation between post pages
4. **Click-to-View** - Click anywhere on post card to view details

### Single Post View

1. **Full Details** - Complete post with author info and media
2. **Comments** - Load comments on-demand when clicking comment button
3. **Interactions** - Like, comment, and share functionality
4. **Responsive** - Optimized layout for all screen sizes

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run test suite
- `npm run format` - Format code with Prettier

## API Integration

The platform integrates with the **Noroff Social API v2** for:

- User authentication and registration
- Posts fetching with pagination
- Search functionality
- Comments and reactions
- User profiles and social features

### Key Endpoints Used:

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /social/posts` - Fetch posts with pagination
- `GET /social/posts/search` - Search posts
- `GET /social/posts/:id` - Get single post
- `GET /social/posts/:id/comments` - Get post comments
- `POST /social/posts/:id/react` - Add/remove reactions
- `POST /social/posts` - Create post
- `POST /social/posts/:id` - Update post
- `POST /social/posts` - Delete post

## User Experience Features

### Visual Feedback

- **Hover effects** on interactive elements
- **Loading animations** for API calls
- **Smooth transitions** between states
- **Visual indicators** for clickable areas

### Error Handling

- **Form validation** with helpful messages
- **API error recovery** with retry options
- **Network error handling** with offline support
- **404 page** with navigation back to content

### Performance Optimizations

- **Lazy loading** for images and comments
- **Efficient pagination** to reduce API calls
- **Local storage** for authentication persistence
- **Debounced search** to optimize API requests

## Security Features

- **JWT token authentication**
- **Secure local storage** handling
- **API key management**
- **Input validation** and sanitization
- **Protected routes** with authentication guards

## Testing

The project includes comprehensive testing with Vitest:

- **Unit tests** for utilities and helpers
- **Component testing** for UI elements
- **Integration tests** for API interactions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of a school assignment and is intended for educational purposes.

## Acknowledgments

- **Noroff API v2** for providing the backend services
- **Vite** for the amazing development experience
- **TypeScript** for type safety and developer experience
- **CSS Custom Properties** for maintainable styling

## Team & Collaborative

- Muhammad Hammad Khan (@Hammadniazi)
- Renate Pedersen (@03-renate)
- Sergiu D. Sarbu (@sergiu-sa)

**Made with love for social connection and learning**

_This social media platform demonstrates modern web development practices with TypeScript, responsive design, and comprehensive user experience features._
