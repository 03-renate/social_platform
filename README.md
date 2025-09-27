
# Vanilla TypeScript SPA – Social Media Platform

A responsive social media application built with TypeScript, Vite, and the Noroff Social API v2.
This project demonstrates modern JavaScript practices: authenticated API consumption, CRUD operations, modular architecture, and responsive design.

## Live Project & Repository

Production Deploy: [Add Netlify/Vercel URL here]

GitHub Repository: [https://github.com/03-renate/social_platform](https://github.com/03-renate/social_platform)

API Base URL: [https://v2.api.noroff.dev/social/posts](https://v2.api.noroff.dev/social/posts)

## Login Details (Demo)

Email: [h-s-r@stud.noroff.no](mailto:h-s-r@stud.noroff.no)

Password: Noroff@123

## Features

### Authentication

* User registration with @stud.noroff.no validation
* JWT-based login and secure local storage
* Client-side validation and helpful error messages
* Auto-redirects based on login status

### Feed & Posts

* Interactive post cards with click-to-view details
* Real-time search (users, posts, hashtags)
* Pagination with next/previous navigation
* Responsive grid layout
* Sample demo posts for guests

### Post Management

* Create posts
* Edit posts
* Delete posts
* View posts of other users
* Full single post display with author details

### Post Interactions

* Emoji reactions with hover modal
* Comment system (view and create comments)
* Reply to comments
* Share functionality (native + clipboard fallback)
* Media support (responsive images)
* Hashtags with styling indicators

### Navigation & UX

* Custom client-side routing
* Responsive navbar with search
* Creative 404 page with animations
* Loading states and error handling

## Tech Stack

* Frontend: TypeScript (Vite)
* Styling: CSS3 with custom properties
* API: Noroff Social API v2
* Authentication: JWT + Local Storage
* Routing: Custom client-side router
* Testing: Vitest
* Code Formatting: Prettier

## Quick Start

### Prerequisites

* Node.js v16+
* npm or yarn
* Noroff @stud.noroff.no account

### Installation

1. Clone repository
   `git clone https://github.com/03-renate/social_platform.git`
   `cd social_platform`

2. Install dependencies
   `npm install`

3. Setup environment
   `cp .env.template .env`
   Edit `.env` with your configuration

4. Start development server
   `npm run dev`

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

``` md
src/
├── components/        # Reusable UI
├── pages/             # Login, Register, Feed, Profile, SinglePost, 404
├── services/          # API and business logic
│   ├── api/           # HTTP client
│   ├── auth/          # Authentication utils
│   ├── posts/         # Posts API integration
│   └── interactions/  # Comments & reactions
├── router/            # Client-side routing
├── types/             # TypeScript definitions
├── utils/             # Helpers (auth, storage, ui, validators)
├── constant.ts        # App constants
├── main.ts            # Application entry point
└── style.css          # Global styles

```

## Required Features (Noroff Brief)

* Register & login users
* Create, edit, delete posts
* View feed and single posts
* View user profiles
* Follow/unfollow users
* Search posts
* View own profile
* Group extras: Comment on posts, reply to comments, react to posts ✅

## Testing

* Unit tests for helpers
* Component tests for UI
* Integration tests for API

Run tests:
`npm test`

## Team & Contributions

This was a group project for Noroff FED2-24 (JavaScript 2).

* Muhammad Hammad Khan (@Hammadniazi)
* Renate Pedersen (@03-renate)
* Sergiu D. Sarbu (@sergiu-sa)

Each team member contributed to planning, coding, testing, and styling.

## License

Created for educational purposes as part of Noroff FED2-24 JavaScript 2 Course Assignment.

## Acknowledgments

* Noroff API v2 for backend services
* Vite for the development experience
* TypeScript for type safety
* CSS Custom Properties for styling
* Monde Sineke ([S3ak](https://github.com/S3ak)) – teacher who provided the boilerplate and sample code used as a foundation

---
