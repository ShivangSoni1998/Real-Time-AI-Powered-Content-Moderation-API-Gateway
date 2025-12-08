# Real-Time AI-Powered Content Moderation API Gateway

A full-stack, event-driven application that moderates user-submitted content in real-time using Google's Gemini AI.

## Architecture

-   **Frontend**: Next.js (React) with Socket.io Client.
-   **API Gateway**: Node.js/Express, Kafka Producer, Socket.io Server, Redis Rate Limiting.
-   **Worker Service**: Node.js, Kafka Consumer, Google Gemini AI, Prisma (PostgreSQL), Redis Pub/Sub.
-   **Infrastructure**: Docker Compose (Kafka, Zookeeper, PostgreSQL, Redis).

## Prerequisites

-   Node.js (v18+)
-   Docker & Docker Compose
-   Google Gemini API Key

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    -   Copy `.env.example` to `.env` in `apps/api` and `apps/worker`.
    -   **Important**: Update `apps/worker/.env` with your `GEMINI_API_KEY`.

3.  **Start Infrastructure**:
    ```bash
    docker-compose up -d
    ```

4.  **Initialize Database**:
    ```bash
    cd packages/database
    npx prisma db push
    ```

## Running the Application

You need to run the following services in separate terminals:

1.  **API Gateway**:
    ```bash
    npm run dev -w apps/api
    ```
    *Runs on http://localhost:3001*

2.  **Worker Service**:
    ```bash
    npm run dev -w apps/worker
    ```

3.  **Frontend**:
    ```bash
    npm run dev -w apps/web
    ```
    *Runs on http://localhost:3000*

## Testing

1.  Open [http://localhost:3000](http://localhost:3000).
2.  Wait for the "System Online" indicator.
3.  Enter text in the submission box and click "Analyze Content".
4.  Watch the result appear in the Live Feed instantly!
