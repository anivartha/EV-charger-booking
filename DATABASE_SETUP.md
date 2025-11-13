# Database Setup Guide

## Current Issue
The server cannot connect to PostgreSQL because the password in `.env` doesn't match your PostgreSQL password.

## Solutions

### Option 1: Update .env with Correct Password

1. Find your PostgreSQL password:
   - If you set it during installation, use that password
   - If you forgot it, see Option 2 below

2. Update the `.env` file:
   ```
   DB_PASSWORD=your_actual_password_here
   ```

### Option 2: Reset PostgreSQL Password

#### Using pgAdmin (GUI):
1. Open **pgAdmin** (usually in Start Menu)
2. Connect to your PostgreSQL server
3. Right-click on the server → Properties → Change password
4. Update `.env` with the new password

#### Using Command Line:
1. Find PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\18\bin`)
2. Open PowerShell as Administrator
3. Run:
   ```powershell
   cd "C:\Program Files\PostgreSQL\18\bin"
   .\psql.exe -U postgres
   ```
4. If it asks for password and you don't know it, you may need to:
   - Edit `pg_hba.conf` to allow local connections without password
   - Or reinstall PostgreSQL

### Option 3: Use Different Database User

If you have another PostgreSQL user, update `.env`:
```
DB_USER=your_username
DB_PASSWORD=your_password
```

### Option 4: Create Database and Schema

Once connected, you need to:
1. Create the database: `ev_charger_booking`
2. Run the schema from `src/db/schema.sql`

You can do this in pgAdmin or using the setup script after fixing the password.

## Quick Test

After updating `.env`, test the connection:
```bash
node setup-db.js
```

If successful, start the server:
```bash
npm run dev
```

## Default Passwords to Try

Common default passwords (if you didn't change it):
- `postgres`
- `admin`
- `password`
- (empty/blank)

Try updating `.env` with these one by one.

