# Student Management System backend

## Setup

1. Install Node.js and MongoDB.
2. Copy `.env.example` to `.env` and set `MONGO_URI` and a long, random `JWT_SECRET`.
3. From this directory, run `npm install` and then `npm start`.

The API listens on port `5000` by default. Set `PORT` to change it. The local MongoDB URI is used when `MONGO_URI` is not set.

## API routes

- `POST /api/auth/register` and `POST /api/auth/login`
- `/api/students`
- `/api/attendance`
- `/api/results`

The `.env` file is ignored by Git. Never commit database credentials or signing secrets.
