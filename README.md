# SneakerHead - High-Performance Limited Edition Drop Platform

A full-stack, real-time e-commerce application designed specifically for high-concurrency "flash sale" events. This platform handles massive traffic spikes, prevents inventory overselling through optimistic/pessimistic locking strategies, and manages temporary cart reservations with precision.

## 🌟 Core Features

### 🛍️ Drop Mechanics

- **Live Drops**: Real-time listing of active sneaker releases.
- **Upcoming Releases**: Preview of scheduled drops with countdowns.
- **Inventory Management**: Strict inventory tracking (Total, Available, Reserved, Sold).

### ⚡ Real-Time Engine (Socket.IO)

- **Instant Updates**: Stock counters update instantly across all connected clients without refreshing.
- **Live Ticker**: "Recent Buyers" feed updates in real-time as purchases are confirmed.
- **Stock Recovery**: When a reservation expires, stock is immediately reflected as available to other users.

### 🛡️ Concurrency & Integrity

- **Race Condition Prevention**: Uses PostgreSQL Row-Level Locking (`FOR UPDATE`) to ensure no two users can reserve the same last item.
- **Atomic Transactions**: Critical operations (Reserve, Purchase, Cancel, Expire) are wrapped in ACID transactions.
- **60-Second Reservation**: A temporary hold system that guarantees stock for a user while they complete checkout.

### 👤 User Experience

- **Authentication**: Secure login/signup via Clerk.
- **Profile Management**: Update profile details and avatars.
- **Interactive UI**: Shadcn UI components, optimistic UI updates, and loading states.

---

## 🏗️ Architecture Deep Dive

### 1. The Reservation Lifecycle (The "60-Second Logic")

The most critical part of a drop system is handling the "Add to Cart" action. In high-demand scenarios, "Adding to Cart" is actually a temporary **reservation**.

#### Step 1: User Request

User clicks "Reserve". The client sends a `POST` request to `/api/drops/:id/reserve`.

#### Step 2: Database Transaction (The "Lock")

The server starts a Sequelize transaction.

1.  **Lock**: It executes `SELECT * FROM drops WHERE id = :id FOR UPDATE`.
    - _Why?_ This locks the specific drop row. No other transaction can read or write to this row until this transaction commits or rolls back.
    - _Effect_: If 100 users try to reserve the last item simultaneously, they are queued. The first one gets the lock, decreases stock, and commits. The subsequents read the updated stock (0) and fail.
2.  **Check**: `if (drop.availableStock < 1) throw Error('Out of Stock')`.
3.  **Update**:
    - `availableStock` = `availableStock` - 1
    - `reservedStock` = `reservedStock` + 1
4.  **Create**: A `Reservation` record is created with `expiresAt = NOW() + 60s`.
5.  **Commit**: Transaction ends. Lock is released.

#### Step 3: Global Broadcast

The server emits `reservation-created` and `stock-updated` events via Socket.IO. All clients confirm the new stock count immediately.

#### Step 4: Expiration Cleanup (The "Reaper")

A background service (`reservationCleanup.js`) runs every 5 seconds.

1.  **Scan**: Finds all reservations where `status = 'active'` AND `expiresAt < NOW()`.
2.  **Reclaim**: For each expired reservation:
    - Starts a transaction.
    - Locks the Drop row.
    - `reservedStock` - 1
    - `availableStock` + 1
    - Sets reservation status to `expired`.
    - Commits.
3.  **Broadcast**: Emits `stock-recovered`. Users see the "Sold Out" button potentially flip back to "Reserve" instantly.

### 2. Database Schema

The comprehensive SQL schema designed for data integrity.

#### Users Table

| Field      | Type   | Description               |
| :--------- | :----- | :------------------------ |
| `id`       | UUID   | Primary Key               |
| `clerk_id` | STRING | External Auth ID (Unique) |
| `email`    | STRING | User Email                |
| `role`     | ENUM   | 'user', 'admin'           |

#### Drops Table

| Field             | Type    | Description                                     |
| :---------------- | :------ | :---------------------------------------------- |
| `id`              | UUID    | Primary Key                                     |
| `name`            | STRING  | Product Name                                    |
| `price`           | DECIMAL | Unit Price                                      |
| `total_stock`     | INT     | Hard limit of inventory                         |
| `available_stock` | INT     | Inventory currently claimable                   |
| `reserved_stock`  | INT     | Inventory currently in carts (active 60s timer) |
| `sold_stock`      | INT     | Inventory successfully purchased                |
| `status`          | STRING  | 'upcoming', 'live', 'ended'                     |
| `drop_start_time` | DATE    | When the drop goes live                         |

#### Reservations Table

| Field        | Type   | Description                                   |
| :----------- | :----- | :-------------------------------------------- |
| `id`         | UUID   | Primary Key                                   |
| `drop_id`    | UUID   | FK to Drops                                   |
| `user_id`    | STRING | Clerk User ID                                 |
| `status`     | STRING | 'active', 'completed', 'expired', 'cancelled' |
| `expires_at` | DATE   | Timestamp when the reservation dies           |

#### Purchases Table

| Field               | Type    | Description                      |
| :------------------ | :------ | :------------------------------- |
| `id`                | UUID    | Primary Key                      |
| `reservation_id`    | UUID    | Link to the original reservation |
| `price_at_purchase` | DECIMAL | Freezes price at time of sale    |

---

## 💻 Tech Stack & Libraries

### Client-Side

- **Framework**: React 18 + TypeScript (Vite)
- **State Management**: Redux Toolkit (global state) + RTK Query (caching & API)
- **Styling**: Tailwind CSS + Shadcn UI (for accessible, beautiful components)
- **Real-time**: `socket.io-client`
- **Auth**: `@clerk/clerk-react`
- **Icons**: `lucide-react`
- **Routing**: `react-router-dom`

### Server-Side

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via NeonDB or local)
- **ORM**: Sequelize (for robust transaction support)
- **Real-time**: `socket.io`
- **Auth Middleware**: Custom middleware checking Clerk tokens via `@clerk/clerk-sdk-node`
- **Scheduling**: `setTimeout`/`setInterval` based cleanup service

---

## 🚀 Installation & Setup Guide

### Prerequisites

1.  **Node.js**: v18 or higher.
2.  **PostgreSQL**: A running instance (local or cloud like Neon/Supabase).
3.  **Clerk Account**: Create an application at [clerk.com](https://clerk.com) to get keys.

### 1. Server Configuration

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=3000
# Connection string to your Postgres database
DB_URL=postgresql://user:password@host:port/database?sslmode=require
# From Clerk Dashboard > API Keys
CLERK_SECRET_KEY=sk_test_...
# URL of your frontend (for CORS)
CLIENT_URL=http://localhost:5173
```

Run the server (development mode with hot-reload):

```bash
npm run dev
```

### 2. Client Configuration

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
# From Clerk Dashboard > API Keys
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
# URL of your backend server
VITE_API_URL=http://localhost:3000
```

Run the client:

```bash
npm run dev
```

---

## 🌐 API Documentation

### Drops

- `GET /api/drops/live`: Fetch currently active drops. Returns nested top 3 purchasers.
- `GET /api/drops/upcoming`: Fetch future drops.
- `POST /api/drops`: (Admin) Create a new drop.
- `PATCH /api/drops/:id/stock`: (Internal) Manual stock adjustment.

### Reservations

- `POST /api/drops/:dropId/reserve`: **Core Action**. Attempts to reserve a unit. Returns transaction result.
- `POST /api/reservations/:id/purchase`: Converts a reservation into a permanent purchase.
- `DELETE /api/reservations/:id/cancel`: User manually cancels (returns stock to pool).

### Authentication

- `GET /api/auth/me`: Get current user details from DB.
- `PUT /api/auth/profile`: Update user profile (name, image).

---

## 🔌 Socket Events

The system relies heavily on these events for the live experience.

| Event                 | Direction       | Payload                             | Description                                                        |
| :-------------------- | :-------------- | :---------------------------------- | :----------------------------------------------------------------- |
| `join-drop`           | Client → Server | `dropId`                            | Client subscribes to updates for a specific drop                   |
| `stock-updated`       | Server → Client | `{ dropId, total, available, ... }` | Emitted on ANY stock change (reserve/release/buy)                  |
| `purchase-created`    | Server → Client | `{ purchase, user }`                | Emitted when a purchase is finalized. Adds user to "Recent Buyers" |
| `reservation-created` | Server → Client | `{ reservation }`                   | Confirmation of reservation start                                  |
| `stock-recovered`     | Server → Client | `{ dropId, ... }`                   | Emitted when the cleaner releases expired stock                    |

---

## 🛠️ Project Structure

```
sneakerhead/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── features/       # Feature-based folder structure
│   │   │   ├── auth/       # Login/Signup components
│   │   │   ├── dashboard/  # Sidebar, Header, Profile
│   │   │   └── drops/      # Core Domain: Drops, Tables, Modals
│   │   │   │   ├── components/ # LiveDrops, DropsTable, ReservationModal
│   │   │   │   ├── hooks/      # useLiveDrops (Business Logic)
│   │   │   │   └── dropsApi.ts # RTK Query & Socket listeners
│   │   ├── components/ui/  # Shared Shadcn components
│   │   └── types/          # TypeScript definitions
│   └── ...
└── server/                 # Node.js Backend
    ├── src/
    │   ├── config/         # DB & Socket configuration
    │   ├── controllers/    # Request handlers (Transaction logic here)
    │   ├── middlewares/    # Auth verification
    │   ├── models/         # Sequelize schemas
    │   ├── routes/         # Express routes
    │   └── services/       # Background tasks (reservationCleanup.js)
    └── ...
```

---

## ❓ Troubleshooting

**Q: My stock isn't updating live.**
A: Ensure your client `.env` points to the correct `VITE_API_URL` and that the backend server allows CORS from your client's origin.

**Q: I get "Out of Stock" even when it says "1 left".**
A: This is likely a race condition where another user (or the background cleaner) modified the stock milliseconds before your request. The UI is _optimistic_ but the Database is the source of truth.

**Q: Images are broken.**
A: Ensure the `imageUrl` provided in the DB is a distinct, public URL. When updating profile pictures, use direct image links.
