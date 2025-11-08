# UPVC Admin Panel

A modern admin panel built with React, Vite, and Tailwind CSS for managing the UPVC platform.

## Features

- 🔐 **Authentication** - Secure login system
- 📊 **Dashboard** - Overview of all statistics
- 🖼️ **Banner Management** - Create, update, and delete banners
- 📁 **Category Management** - Manage categories and subcategories
- ⚙️ **Options Management** - Manage options and sub-options
- 💰 **Pricing Management** - Manage video and heading pricing
- 📢 **Advertisement Management** - Manage advertisements
- 🏠 **Homepage Management** - Manage homepage content and key moments
- 👥 **Seller Management** - Approve, reject, and manage sellers
- 📋 **Lead Management** - View and manage leads

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `https://upvc-backend-new.onrender.com` (or configure in `.env`)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (optional):
```env
VITE_API_BASE_URL=https://upvc-backend-new.onrender.com/api
VITE_UPLOAD_BASE_URL=https://upvc-backend-new.onrender.com
```

3. Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173` (or the port Vite assigns).

## Default Login Credentials

- **Email**: `admin@gmail.com`
- **Password**: `admin@123`

## Building for Production

To build the admin panel for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # Reusable components (Layout, ProtectedRoute)
├── config/          # Configuration files
├── context/         # React context (AuthContext)
├── pages/           # Page components
├── services/        # API service layer
└── App.jsx          # Main app component with routing
```

## API Integration

The admin panel connects to the backend API at `https://upvc-backend-new.onrender.com/api`. All API calls are handled through service files in the `src/services/` directory.

## Technologies Used

- **React 19** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Development

The admin panel uses Vite for fast development with Hot Module Replacement (HMR). Any changes to the code will automatically reflect in the browser.
