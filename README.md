# Quiz App (Full-Stack Assessment)

A simple quiz application demonstrating full-stack integration with **React + TypeScript + Vite + Tailwind + Zustand** on the frontend and **Express + TypeScript + Prisma + PostgreSQL (Render)** on the backend. Includes **JWT auth**, protected routes, CRUD for questions, and a basic quiz flow with results and timer.

---

## Tech Stack

**Frontend**
- React 18 + TypeScript (Vite)
- React Router v6
- Zustand (auth + quiz state)
- Tailwind CSS
- Axios

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM (PostgreSQL)
- JWT auth (bcrypt, jsonwebtoken)
- CORS, express-validator

**Infra**
- DB: Render Postgres
- Backend: Render Web Service
- Frontend: Vercel

---

## Features

- Register/Login (JWT)
- Protected Questions page (CRUD)
- Quiz flow: per-question view, next/prev, radio options, timer, submit → score + time
- Basic validation & error handling
- Clean REST API & types

---

## Monorepo Layout

