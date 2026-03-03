# Architecture Documentation

This document outlines the new architecture introduced to decouple business logic from the UI layer in the `vision-ai.tech` codebase.

## Overview

We have introduced two key patterns:
1.  **Repository Pattern**: To abstract database interactions
2.  **Strategy Pattern**: To handle multiple payment providers seamlessly

## 1. Repository Pattern

### Purpose
The Repository pattern isolates the data access logic from the SvelteKit `+page.server.js` (Controller) layer. This allows:
-   Easier testing (mocking repositories)
-   Centralized data logic (consistent queries)
-   Clean UI code (focused on adapting data for the view).

### Implementation
We created `ProductRepository` and `UserRepository` in `$lib/server/repositories`.

#### Class Diagram
```mermaid
classDiagram
    class PageServer {
        +load()
        +actions
    }
    class ProductRepository {
        +findMany(params)
        +findById(id)
        +create(data)
        +update(id, data)
        +delete(id)
        -_syncRelations()
    }
    class Database {
        +query
        +insert()
        +update()
        +delete()
    }

    PageServer --> ProductRepository : Uses
    ProductRepository --> Database : Accesses
```

#### Example Flow (Admin Products Load)
```mermaid
sequenceDiagram
    participant Client
    participant PageServer as +page.server.js
    participant Repo as ProductRepository
    participant DB as Postgres

    Client->>PageServer: GET /admin/products?q=search
    PageServer->>Repo: findMany({ page: 1, query: 'search' })
    Repo->>DB: Select products (with relations)
    Repo->>DB: Count total items
    DB-->>Repo: Data
    Repo-->>PageServer: { products, totalItems, totalPages }
    PageServer-->>Client: Render Page
```

## 2. Strategy Pattern (Payments)

### Purpose
The Strategy pattern allows the application to switch between different payment providers (Paynow, Paystack) dynamically without cluttering the main service logic with `if/else` checks for every provider.

### Implementation
-   **Context**: `PaymentService` (Factory + Execution)
-   **Interface**: `PaymentStrategy`
-   **Concrete Strategies**: `PaynowStrategy`, `PaystackStrategy`

#### Class Diagram
```mermaid
classDiagram
    class PaymentService {
        +getStrategy(provider)
        +initiateRedirectTransaction()
    }
    
    class PaymentStrategy {
        <<interface>>
        +initiateRedirectTransaction()
        +isHealthy()
    }
    
    class PaynowStrategy {
        +initiateRedirectTransaction()
        +initiateExpressTransaction()
        +isHealthy()
    }
    
    class PaystackStrategy {
        +initiateRedirectTransaction()
        +isHealthy()
    }

    PaymentService --> PaymentStrategy : Uses
    PaynowStrategy --|> PaymentStrategy : Implements
    PaystackStrategy --|> PaymentStrategy : Implements
```

#### Example Flow (Checkout Initiation)
```mermaid
sequenceDiagram
    participant Client
    participant API as Checkout API
    participant Service as PaymentService
    participant Strategy as PaynowStrategy
    participant Provider as Paynow API

    Client->>API: POST /checkout/initiate (USD, Card)
    API->>API: Create Order (Pending)
    API->>Service: initiateRedirectTransaction('paynow', ...)
    Service->>Strategy: initiateRedirectTransaction(...)
    Strategy->>Provider: HTTP POST (Initiate)
    Provider-->>Strategy: { browserurl, pollurl, status }
    Strategy-->>Service: PaymentResponse
    Service-->>API: PaymentResponse
    API-->>Client: { redirectUrl, pollUrl }
```

## 3. System Health

We added a `SystemHealthService` to verify the status of these critical components.

```mermaid
graph TD
    Monitor[SystemHealthService]
    DB[(Database)]
    Paynow[Paynow API]
    Paystack[Paystack API]

    Monitor -->|Check Connectivity| DB
    Monitor -->|Check Config/Reachability| Paynow
    Monitor -->|Check Config/Reachability| Paystack
```
