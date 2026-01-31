# ShivBAS Frontend

React-based frontend application for ShivBAS (Budget & Analytics System).

## Features

- ✅ **Authentication**: Login with JWT token management
- ✅ **Admin Dashboard**: Overview of budgets, analytics, and events
- ✅ **Budget Management**: View and track budget progress
- ✅ **Analytics Events**: Display recent events with profit tracking
- ✅ **Role-Based Access**: Admin and Portal user roles
- ✅ **Responsive Design**: Clean and minimal UI with Tailwind CSS

## Tech Stack

- **React** 18.x
- **React Router** 6.x
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Context API** for state management

## Database Field Mapping

All form fields and API calls match the backend database schema exactly:

### Users Table
- `login_id` - 6-12 chars, alphanumeric + underscore
- `email` - Valid email format
- `password` - Min 8 chars with complexity requirements
- `name` - Full name
- `role` - 'admin' or 'portal'

### Budgets Table
- `event_name` - Event name
- `analytics_id` - FK to analytics table
- `type` - 'income' or 'expense'
- `budgeted_amount` - Decimal(15,2)
- `achieved_amount` - Decimal(15,2)
- `percentage_achieved` - Auto-calculated
- `amount_to_achieve` - Auto-calculated
- `start_date` - Date
- `end_date` - Date

### Analytics Table
- `event_name` - Event name
- `partner_tag` - 'supplier' or 'customer'
- `partner_id` - FK to users
- `product_id` - FK to products
- `no_of_units` - Integer
- `unit_price` - Decimal(10,2)
- `profit` - Decimal(15,2)
- `profit_margin_percentage` - Decimal(5,2)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will run on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## Test Credentials

### Admin User
- **Login ID**: admin_user
- **Password**: Test@123

### Portal User
- **Login ID**: john_portal
- **Password**: Test@123

## Project Structure

```
src/
├── components/
│   ├── Layout.js          # Main layout with sidebar
│   └── ProtectedRoute.js  # Route protection wrapper
├── context/
│   └── AuthContext.js     # Authentication context
├── pages/
│   ├── Login.js           # Login page
│   └── Dashboard.js       # Admin dashboard
├── services/
│   └── api.js             # API service with axios
├── App.js                 # Main app component
├── index.js               # Entry point
└── index.css              # Tailwind CSS styles
```

## API Integration

All API endpoints are configured in `src/services/api.js`:

- **Authentication**: `/auth/login`, `/auth/logout`, `/auth/me`
- **Budgets**: `/budgets` (GET, POST, PUT)
- **Analytics**: `/analytics` (GET, POST)
- **Dashboard**: `/dashboard/summary`, `/dashboard/budgets-overview`
- **Products**: `/products` (GET, POST)
- **Contacts**: `/contacts` (GET, POST)
- **Invoices**: `/invoices` (GET, POST)
- **Payments**: `/payments` (GET, POST)

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner

## Integration with Backend

1. Ensure backend is running on `http://localhost:5000`
2. Backend should have CORS enabled for `http://localhost:3000`
3. All API responses follow the contract defined in `API_CONTRACTS.md`

## Key Features

### Authentication Flow
1. User enters login_id and password
2. Frontend sends POST to `/auth/login`
3. Backend returns JWT token and user data
4. Token stored in localStorage
5. Token sent in Authorization header for all requests
6. Auto-redirect to login on 401 errors

### Dashboard Features
- Summary cards showing total budgets, events, income, and expenses
- Budget overview table with progress bars
- Status badges (Safe, On Track, Warning, Critical)
- Recent analytics events grid
- Role-based UI (admin sees create buttons)

### Protected Routes
- All routes except `/login` require authentication
- Admin-only routes check for admin role
- Automatic redirect to login if not authenticated

## Styling

Uses Tailwind CSS with custom utility classes:
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.input-field` - Form input styling
- `.card` - Card container
- `.table-header` - Table header styling
- `.table-row` - Table row with hover effect

## Future Enhancements

- [ ] Budget creation form
- [ ] Analytics event creation form
- [ ] Invoice management
- [ ] Payment tracking
- [ ] Reports and charts
- [ ] Real-time notifications
- [ ] Export to PDF/Excel

## Notes for Backend Integration

- All field names match database schema exactly
- Date formats: ISO 8601 (YYYY-MM-DD)
- Currency: Indian Rupees (₹)
- Decimal precision matches database (15,2 for amounts, 5,2 for percentages)
- Enum values match database constraints exactly
- Foreign key relationships preserved in API calls

## Support

For issues or questions, refer to:
- `API_CONTRACTS.md` - Complete API documentation
- `DATABASE_REFERENCE.md` - Database schema reference
- `FRONTEND_INTEGRATION_GUIDE.md` - Integration guide
