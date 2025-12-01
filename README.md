# Spark Bridge Test API

API built with NestJS and Supabase.

## Features

- **Authentication**: User registration and login with Supabase Auth
- **Products**: Complete CRUD operations for product management
- **Comments**: Product reviews and ratings system with authentication
- **Shopping Cart**: Add, update, and manage cart items
- **Row Level Security**: Database-level security with RLS policies
- **Pagination**: Built-in pagination support for listings
- **Validation**: Request validation using class-validator
- **Error Handling**: Global exception filters and error responses

## DB Schema
![DB Schema](./db-schema.png#center)

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- yarn

### Installation

1. Clone the repository:
```bash
git clone git@github.com:codewisedev/supabase-test.git
cd supabase-test
```

2. Install dependencies:
```bash
yarn install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your Supabase credentials:
     ```
     SUPABASE_URL=https://your-supabase-url.supabase.co
     SUPABASE_ANON_KEY=your-anon-key-here
     SUPABASE_SERVICE_KEY=your-service-key-here
     PORT=3000
     ```
4. Seed default users
```
node scripts/seed-users.js
```

5. Start the server:
```bash
yarn start
```

The API will be available at `http://localhost:3000`

## Testing

The Postman collection is included in `postman_collection.json`. Import it into Postman to test all endpoints.

### Test Credentials

Use the following credentials to test the login functionality:

#### Admin
- Email: `admin@example.com`
- Password: `secureAdminPassword123`

#### Customer
- Email: `test@example.com`
- Password: `Test@123456`

## Build

```bash
yarn build
```

## Scripts

- `yarn start:dev` - Start development server with hot reload
- `yarn start:prod` - Start production server
- `yarn build` - Build the project
- `yarn format` - Run biome code formatter

## Architecture

The project follows a modular NestJS architecture:

```
src/
├── auth/              # Authentication module
├── products/          # Products module
├── comments/          # Comments module
├── cart/              # Cart module
├── common/            # Shared utilities, filters, pipes
└── config/            # Configuration files
```

## Environment Variables

```
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
PORT=3000
```

## License

This project is licensed under the ISC License.