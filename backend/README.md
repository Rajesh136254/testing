# Backend (Node.js + Express + MySQL)

Setup:

```powershell
cd backend
npm install
# create a .env file or edit the existing one to set DB credentials
npm run start
```

API:
- GET /api/hello -> test message
- GET /api/users -> list users
- POST /api/users -> create user { name, email }
- DELETE /api/users/:id -> delete user

Notes:
- Uses `mysql2` with a connection pool in `db.js`.
- Simple table creation is run on startup in `routes/users.js`.
