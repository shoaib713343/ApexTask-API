# ApexTask API 🚀

A production-grade, multi-tenant REST API for a collaborative task management platform (similar to Trello/Jira). Built with Node.js, Express, TypeScript, and PostgreSQL.

## 🌟 Key Highlights (What makes this project complex)

* **Multi-tenant Security:** Implemented robust Role-Based Access Control (RBAC). Users can be `ADMIN` or `MEMBER` of various organizations, with strict permission checks for every action.
* **Advanced Data Integrity:** Used **database transactions** for complex operations like moving cards between lists to ensure atomicity (e.g., shifting ranks of other cards and moving the target card happen together or not at all).
* **Secure Authentication:** Built from scratch using short-lived **JWT access tokens** and long-lived **httpOnly refresh tokens** to prevent XSS attacks, along with secure password hashing (bcrypt).
* **Complex Logic:** Implemented a "Last Admin" safety check using `COUNT()` queries to prevent organizations from being orphaned.
* **Modern Stack:** Leveraged **Drizzle ORM** for type-safe SQL queries and **Zod** for strict runtime validation of all inputs.

## 🛠️ Tech Stack

* **Runtime:** Node.js with TypeScript
* **Framework:** Express.js
* **Database:** PostgreSQL (running via Docker)
* **ORM:** Drizzle ORM
* **Validation:** Zod
* **Auth:** jsonwebtoken (JWT), bcryptjs

## 🗂️ Database Schema

The project uses a normalized relational schema:
* `Organization` -> has many -> `Boards`
* `Board` -> has many -> `Lists`
* `List` -> has many -> `Cards`
* `Users` <-> `Organizations` (Many-to-Many via a `Permissions` join table with roles)

## 🚀 Getting Started

1.  **Clone the repo**
2.  **Install dependencies:** `npm install`
3.  **Setup Environment:** Create a `.env` file with:
    ```env
    DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
    JWT_SECRET=your_strong_secret
    JWT_EXPIRY=15m
    REFRESH_TOKEN_SECRET=another_strong_secret
    REFRESH_TOKEN_EXPIRY=7d
    ```
4.  **Run Database Migrations:** `npx drizzle-kit push:pg` (or your migration command)
5.  **Start Server:** `npm run dev`