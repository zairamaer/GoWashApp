# GoWash Admin Portal

A modern admin interface for managing GoWash car wash services, built with Vue.js 3 and Vue Router.

## Features

### 🔐 Admin Authentication
- Secure login form with email/password validation
- JWT token-based authentication
- Automatic token refresh and logout handling
- Protected routes with navigation guards

### 📊 Service Management
- **Service Rates Management**: Create, read, update, and delete service rates
- **Service Types Management**: Manage different types of car wash services
- **Vehicle Sizes Management**: Handle different vehicle size categories
- Real-time data synchronization with the API

### 📅 Appointment Management
- View all customer appointments
- Update appointment status (pending, confirmed, completed, cancelled)
- Delete appointments when necessary
- Customer information display

### 📈 Analytics Dashboard
- Total appointments count
- Pending appointments tracking
- Total services available
- Daily revenue calculation

## API Integration

The admin portal integrates with the GoWash API endpoints:

- **Authentication**: `/api/admin/login`, `/api/admin/register`
- **Service Rates**: `/api/service-rates`
- **Service Types**: `/api/service-types`
- **Vehicle Sizes**: `/api/vehicle-sizes`
- **Appointments**: `/api/appointments`
- **Payments**: `/api/payments`

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Admin Login

1. Navigate to `/admin/login`
2. Enter your admin credentials
3. Upon successful login, you'll be redirected to the dashboard

## Project Structure

```
src/
├── components/
│   ├── AdminLogin.vue      # Admin login form
│   └── AdminDashboard.vue  # Main admin dashboard
├── services/
│   └── api.js             # API service layer
├── router/
│   └── index.js           # Vue Router configuration
├── App.vue                # Root component
├── main.js                # Application entry point
└── style.css              # Global styles
```

## Key Components

### AdminLogin.vue
- Modern, responsive login form
- Form validation and error handling
- Loading states and user feedback
- Gradient background with card-based design

### AdminDashboard.vue
- Tabbed interface for different management sections
- Data tables with CRUD operations
- Modal forms for adding/editing records
- Real-time statistics and analytics
- Responsive design for mobile devices

### API Service (api.js)
- Centralized API communication
- Axios interceptors for authentication
- Error handling and token management
- Modular service functions for different endpoints

## Styling

The application uses a modern design system with:
- CSS custom properties for consistent theming
- Responsive design with mobile-first approach
- Smooth animations and transitions
- Professional color scheme with accessibility in mind

## Security Features

- JWT token storage in localStorage
- Automatic token refresh
- Route protection with navigation guards
- Secure API communication with proper headers
- Input validation and sanitization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

The application is configured to work with the production API at `https://gowashapp.online/api`. For development with a local API, update the baseURL in `src/services/api.js`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the GoWash application ecosystem.
