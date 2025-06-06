# College E-Voting System

A secure and efficient online voting system for college elections, built with React, React Router, and Zustand for state management.

## Features

- **User Authentication**
  - Student registration and login
  - Role-based access control (Admin/Student)
  - Protected routes

- **Student Features**
  - View active elections
  - Cast votes in ongoing elections
  - View election results

- **Admin Features**
  - Manage elections (create, edit, delete)
  - Manage candidates
  - Manage student accounts
  - View and manage election results

## Tech Stack

- **Frontend**: React 18, React Router 6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd project
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Available Scripts

- `npm run dev` or `yarn dev` - Start the development server
- `npm run build` or `yarn build` - Build the app for production
- `npm run preview` or `yarn preview` - Preview the production build
- `npm run lint` or `yarn lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
├── layouts/        # Layout components
├── pages/          # Page components
│   ├── admin/      # Admin pages
│   ├── auth/       # Authentication pages
│   └── student/    # Student pages
├── stores/         # State management
├── types/          # Type definitions
├── utils/          # Utility functions
├── App.jsx         # Main App component
└── main.jsx        # Entry point
```

## Default Accounts

### Admin
- Email: admin@example.com
- Password: admin123

### Student
- Email: john@example.com
- Password: student123

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
