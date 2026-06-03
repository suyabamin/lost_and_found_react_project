# Lost & Found Project - Setup and Database Initialization Guide

## Database Setup

### Prerequisites
- MySQL/MariaDB installed and running (default: localhost:3306)
- Default credentials: username=`root`, password=`` (empty)

### Step 1: Initialize Database

#### Option A: Using MySQL Command Line

```bash
# Connect to MySQL
mysql -u root

# Then run:
source database/schema.sql;
```

#### Option B: Automatic Setup (Recommended)

Run this PowerShell command from project root:

```powershell
$sqlFile = "database\schema.sql"
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

# Execute the schema
& $mysqlPath -u root < $sqlFile
```

### Step 2: Verify Database Created

```bash
mysql -u root
USE lost_found;
SHOW TABLES;
```

You should see these 9 tables:
- users
- categories
- items
- conversations
- messages
- favorites
- claims
- reports
- notifications

## Project Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment Files

#### `.env` (Frontend)
```
VITE_API_URL=http://127.0.0.1:8000/api
VITE_GOOGLE_MAPS_API_KEY=
```

### 3. Start the Full Project

#### Option A: Using npm scripts

In separate terminals:

```bash
# Terminal 1 - Start Backend (PHP)
npm run backend
# Server will run at http://127.0.0.1:8000

# Terminal 2 - Start Frontend (React)
npm run dev
# App will run at http://127.0.0.1:5173
```

#### Option B: Using PowerShell Script

```powershell
.\start-full-project.ps1
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Items/Posts
- `GET /api/items` - List all items
- `POST /api/items` - Create new item
- `GET /api/items/{id}` - Get item details
- `POST /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

### Messaging
- `GET /api/conversations` - Get all conversations
- `POST /api/items/{id}/conversations` - Start conversation
- `GET /api/conversations/{id}/messages` - Get messages
- `POST /api/conversations/{id}/messages` - Send message

### Favorites
- `POST /api/items/{id}/favorite` - Toggle favorite

## Troubleshooting

### Database Connection Error
**Problem**: "SQLSTATE[HY000]: General error: 1030 Got error 28"

**Solution**:
1. Ensure MySQL is running: `services.msc` → Find MySQL service → Start if stopped
2. Check credentials in `backend/src/core/Database.php`
3. Import schema: `mysql -u root < database/schema.sql`

### Backend Not Found Error
**Problem**: 404 errors when calling API endpoints

**Solution**:
1. Ensure backend is running on port 8000
2. Check `npm run backend` is executing
3. Verify `.env` file has correct `VITE_API_URL`

### Frontend Blank Page
**Problem**: White screen or "Cannot GET /"

**Solution**:
1. Clear browser cache
2. Rebuild: `npm run build`
3. Restart dev server: `npm run dev`

### Database Already Exists
**Problem**: "Error: Database 'lost_found' already exists"

**Solution**:
```bash
mysql -u root -e "DROP DATABASE lost_found;"
mysql -u root < database/schema.sql
```

## Testing Credentials

Once registered, you can create test accounts or use these if pre-seeded:

```
Email: demo@example.com
Password: password
```

## Development

### Hot Module Replacement
The frontend supports HMR. Edit React components and see changes instantly.

### Database Migrations
For schema changes, update `database/schema.sql` and re-import:
```bash
mysql -u root < database/schema.sql
```

## Project Structure

```
lost_and_found_React/
├── backend/
│   ├── public/
│   │   └── index.php          (API routes)
│   └── src/
│       ├── bootstrap.php       (Setup)
│       ├── controllers/        (API handlers)
│       ├── models/            (DB models)
│       └── core/              (Database, Router, etc.)
├── src/
│   ├── pages/                 (React pages)
│   ├── components/            (React components)
│   ├── services/              (API calls)
│   ├── context/               (Auth context)
│   └── styles/                (CSS modules)
├── database/
│   └── schema.sql             (Database schema)
├── .env                       (Environment config)
└── package.json
```

## Next Steps

1. Ensure database is initialized
2. Start both backend and frontend
3. Navigate to http://127.0.0.1:5173
4. Register a new account
5. Data will be persisted to MySQL database

For questions or issues, check the console logs in both terminal windows for error details.
