# Vision AI Tech

## Overview
This project is built with SvelteKit and uses Drizzle ORM for database interactions. It follows a **Repository Pattern** for data access and a **Strategy Pattern** for payment processing logic, ensuring separation of concerns and testability

## Architecture

This application follows a **three-tier layered architecture** (Controller → Service → Repository → Database) to ensure separation of concerns, maintainability, and testability.

### Layered Architecture

```
┌─────────────────────────────────────┐
│   Controller Layer (Routes)         │  - Handle HTTP requests/responses
│   src/routes/**/*.server.js         │  - Validate input
└──────────────┬──────────────────────┘  - Call services
               │
               ▼
┌─────────────────────────────────────┐
│   Service Layer                      │  - Business logic
│   src/lib/server/services/           │  - Orchestrate repositories
└──────────────┬──────────────────────┘  - Transform data
               │
               ▼
┌─────────────────────────────────────┐
│   Repository Layer                   │  - Data access
│   src/lib/server/repositories/       │  - Database queries
└──────────────┬──────────────────────┘  - CRUD operations
               │
               ▼
         [ Database ]
```

**Critical Rules**:
- ✅ Controllers **CAN** call Services
- ✅ Services **CAN** call Repositories  
- ❌ Controllers **CANNOT** import `db` or Repositories directly
- ❌ Services **CANNOT** import `db` directly

> 📖 See `docs/architecture.md` for complete design documentation and examples

### Repository Pattern

### Payment Strategy
Payment processing logic is abstracted using the Strategy pattern.
- **Service**: `PaymentService` (manages strategy selection).
- **Strategies**: `PaynowStrategy`, `PaystackStrategy` (encapsulate provider-specific logic).
- **Express Checkout**: Mobile money transactions are supported via `initiateExpressTransaction`

### Logger Service
A centralized `LoggerService` provides standard logging across the system (Info, Warn, Error)

## Development Setup

### Prerequisites
- Node.js (v18+)
- Docker (for local Postgres)

### Environment Variables
1. Copy `.env.example` to `.env` (or create one using the provided template).
2. Ensure `DATABASE_URL` is set.

### Running Locally
1. **Start Database**:
   ```bash
   npm run db:start
   ```
2. **Push Schema/Migrate**:
   ```bash
   npm run db:push
   ```
3. **Start Dev Server**:
   ```bash
   npm run dev
   ```

## Testing
Core business logic in Repositories and Services is tested using Vitest

### Running Tests
To run all tests:
```bash
npm run test
```

To run logic/repo tests:
```bash
npm run test src/lib/server/repositories/
```

## Audit Logs
Important actions (Create, Update, Delete) are logged to the `audit_log` table via the `AuditLogRepository` and the `log` helper.

## License
Private.
