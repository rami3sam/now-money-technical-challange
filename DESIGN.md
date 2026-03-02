# DESIGN.md

## Architecture Overview

The system follows a three-layer architecture to ensure separation of concerns, maintainability, and scalability.

---

### 1. Repository Layer

**Responsibilities:**
- Handles all database interactions  
- Contains all database queries  
- Ensures application logic remains decoupled from database implementation  

**Benefits:**
- Easier database replacement or modification  
- Improved maintainability  
- Clear separation between data access and business logic  

---

### 2. Service Layer

**Responsibilities:**
- Contains all business logic  
- Uses repository layer functions to read and update data  
- Acts as the core processing layer of the application  

**Benefits:**
- Centralizes business rules  
- Improves testability  
- Prevents logic duplication  

---

### 3. Controller Layer

**Responsibilities:**
- Handles HTTP requests and responses  
- Validates incoming requests  
- Reads and parses parameters  
- Formats responses  

**Role:**
- Acts as the interface between external clients and internal application logic  

---

## Task Queue (Rudimentary Implementation)

A simple task queue is implemented to support:

- Delayed execution of tasks  
- Retry mechanisms  
- Error handling after exceeding maximum retry attempts  

**Purpose:**
- Handles unreliable external operations  
- Supports background processing  
- Improves system resilience  

---

## State Machine Diagram

![State Transition Diagram](https://github.com/rami3sam/now-money-technical-challange/blob/master/images/state%20transition%20diagram.png?raw=true)

The diagram above illustrates the transfer state transitions.

### Terminal States
- **PAID**
- **CANCELLED**
- **REFUNDED**

### Cancellation Logic
- **CANCELLED** is a terminal state **only if the send amount has not been deducted**.
- If the send amount **has been deducted**, the flow must end in **REFUNDED** instead.

### Quote Refresh Behavior
- The **QUOTED** state can transition to itself.
- This occurs when the sender refreshes the quote.
- Keeping this self-transition helps track that the transfer has been quoted multiple times in the state history.

## Timeouts and Handling Unknown Outcomes

### Timeout Handling

When a request times out, the system retries the operation later.

Retries use:
- Exponential backoff  
- Random jitter  

**Purpose:**
- Prevent overloading the target service when multiple failures occur  
- Provide recovery time before retrying requests  

---

### Unknown Outcomes

If the outcome of an operation is unknown, the system:

- Does not automatically continue the process  
- Does not assume success or failure  

All endpoints are designed to be *idempotent*, meaning:

- Duplicate requests are processed only once (they assert the status of the transfer and proceed accordingly)  
- Safe retries are ensured  
- Consistent system state is maintained  

---

### Compliance & Screening

#### Name Screening

Potential issues:
- Multiple people may share identical names  

Recommended solution:
- Set transfers to `COMPLIANCE_PENDING` instead of immediate rejection  

---

## Improvements for Production Use

### Task Queueing

Use a production-grade task queuer instead of the current rudimentary implementation.

**Benefits:**
- Improved reliability  
- Better retry handling  
- Monitoring capabilities  
- Greater scalability  

---

### Authentication & Authorization

Implement secure authentication and authorization mechanisms.

**Improvements:**
- Role-based authentication  
- Route-level authorization rules  
- Obtain `reviewerId` from the authenticated session instead of query parameters  

**Benefits:**
- Improved security  
- Proper access control  
- Prevention of identity spoofing  

---

### Error Handling

Improve error classification and consistency.

**Improvements:**
- More fine-tuning of status return: 4xx for client errors and 5xx for server errors instead of just returning 4xx  
- Improve client-side error handling by providing error codes instead of just error messages  
- Improve debugging  

---

### Configuration & Thresholds

Store configuration values in the database.

Examples:
- Compliance thresholds  
- Banned countries  
- System limits and other values  

System behavior:
- Load thresholds and values at server startup  
- Subscribe for values changes when new values are published  

**Benefits:**
- No redeployment required for configuration changes  
- Easier operational control  

---

### Performance & Pagination

Implement pagination for:
- `getUserTransfers`  
- `getPayouts`  

**Benefits:**
- Improved performance  
- Reduced memory usage  
- Better scalability  

---

### Process Management

Run the Node.js process using a process manager.

Example:
- PM2  

**Benefits:**
- Automatic restarts  
- Monitoring  
- Improved stability  

---

### Logging

- Generate and log correlation id to track requests between services for easier debugging  
- Add more info and warn level log messages  

---

### Better Code Reuse

Use node workspaces to share code between modules in the monorepo.

---

### Error Detection

Recalculate calculations like the quote received for fx-quote-service, for example on the orchestrator, and stop processing (prevent from confirming) if it doesn't add up until manual review.

---

### Idempotency in POST /transfers

Idempotency in creating transfers. Transfers now are created with Postman so I didn't bother implementing it.

---

### API Versioning

Provide clear API version and update when there are breaking changes in the API.

---

### Rate Limiting

Implement rate limiting to prevent abuse.

Recommended approach:
- Use a reverse proxy (e.g., NGINX)

**Benefits:**
- Protect system resources  
- Prevent abuse  
- Improve reliability  

---

## Summary

This design emphasizes:
- Separation of concerns  
- Reliability  
- Scalability  
- Security  
- Maintainability  

The proposed production improvements ensure the system is robust, secure, and ready for real-world deployment.
