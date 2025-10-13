# Fullstack Angular + Node.js + MySQL Project

This workspace contains two main folders:

- `frontend/frontend-app` — Angular 17+ app with Tailwind CSS and sample pages (Home, About, Contact).
- `backend` — Node.js + Express API with MySQL (mysql2). The backend falls back to an in-memory mock DB when MySQL is not reachable so you can develop without a local MySQL server.

Quick start

1. Backend

```powershell
cd backend
npm install
# edit .env and set DB credentials if you want real MySQL
npm run start
```

2. Frontend

```powershell
cd frontend/frontend-app
npm install
npm start
# opens http://localhost:4200 and proxies /api to http://localhost:3000
```

Notes

- The backend exposes:
  - GET /api/hello
  - GET /api/users
  - POST /api/users { name, email }
  - DELETE /api/users/:id

- If MySQL connection fails, the backend uses an in-memory mock so the above endpoints still work for development.

Next steps I can do if you want:
- Add authentication (JWT)
- Add more frontend pages and forms (users list + create form)
- Add Dockerfile and docker-compose with a MySQL service
- Add unit tests

Tell me which next step you'd like to proceed with.
