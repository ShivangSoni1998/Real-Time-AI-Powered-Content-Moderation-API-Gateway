# 🛡️ Real-Time AI-Powered Content Moderation API Gateway

A robust, event-driven full-stack application that provides real-time content moderation using Google's Gemini AI. This system is designed to be scalable, responsive, and easy to integrate, making it perfect for platforms requiring instant content safety checks.

![Project Logo](./apps/web/public/logo.png)

## 🚀 Features

-   **Real-Time Analysis**: Instant feedback on content safety using WebSockets.
-   **AI-Powered**: Leverages Google's Gemini 2.5 Flash model for accurate and nuanced classification.
-   **Event-Driven Architecture**: Decoupled services using Apache Kafka for high throughput and reliability.
-   **Scalable Infrastructure**: Built with Docker, Redis, and PostgreSQL to handle production-grade loads.
-   **Modern Frontend**: A sleek, responsive dashboard built with Next.js 15 and Tailwind CSS.

## 🛠️ Tech Stack & Rationale

We chose a modern, scalable tech stack to ensure performance, maintainability, and developer experience.

### Frontend
-   **Next.js 15 (React)**: Chosen for its server-side rendering capabilities, SEO benefits, and excellent developer experience.
-   **Tailwind CSS**: For rapid UI development with a utility-first approach, ensuring a consistent and modern design system.
-   **Socket.io Client**: To enable real-time, bidirectional communication with the server for instant updates.
-   **Axios**: For robust and easy-to-use HTTP requests.

### Backend (API Gateway)
-   **Node.js & Express**: Lightweight and efficient for handling high-concurrency I/O operations.
-   **Apache Kafka (Producer)**: Acts as the backbone of our event-driven architecture, decoupling the API from the heavy AI processing. This ensures the API remains fast and responsive even under load.
-   **Redis (Pub/Sub)**: Used for real-time message broadcasting to connected clients, ensuring low-latency updates.
-   **Socket.io Server**: Manages WebSocket connections and broadcasts moderation results to the specific user.

### Worker Service
-   **Node.js**: efficient for processing streams of data.
-   **Kafka (Consumer)**: Consumes messages from the queue at its own pace, preventing system overload.
-   **Google Gemini AI**: Provides state-of-the-art natural language understanding for accurate content classification (Safe vs. Unsafe).
-   **Prisma & PostgreSQL**: A powerful ORM and relational database combination for reliable data persistence and type safety.

### Infrastructure
-   **Docker & Docker Compose**: Containerizes all services (Kafka, Zookeeper, Redis, Postgres) for a consistent and reproducible development environment.
-   **Turborepo**: Manages the monorepo structure, optimizing build and test workflows.

## 🏁 Getting Started

Follow these steps to get the project running locally.

### Prerequisites

-   **Node.js** (v18 or higher)
-   **Docker** and **Docker Compose** installed and running.
-   A **Google Gemini API Key** (Get one [here](https://aistudio.google.com/app/apikey)).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    -   **API Gateway**:
        -   Copy `apps/api/.env.example` to `apps/api/.env`.
    -   **Worker Service**:
        -   Copy `apps/worker/.env.example` to `apps/worker/.env`.
        -   **CRITICAL**: Open `apps/worker/.env` and paste your `GEMINI_API_KEY`.

### Running the Application

1.  **Start Infrastructure Services**:
    This spins up Kafka, Zookeeper, Redis, and PostgreSQL.
    ```bash
    docker-compose up -d
    ```

2.  **Initialize the Database**:
    Push the Prisma schema to your local Postgres instance.
    ```bash
    cd packages/database
    npx prisma db push
    cd ../..
    ```

3.  **Start the Services**:
    You will need **3 separate terminals** to run the full stack:

    **Terminal 1: API Gateway**
    ```bash
    npm run dev -w apps/api
    ```
    *Runs on http://localhost:3001*

    **Terminal 2: Worker Service**
    ```bash
    npm run dev -w apps/worker
    ```

    **Terminal 3: Frontend**
    ```bash
    npm run dev -w apps/web
    ```
    *Runs on http://localhost:3000*

## 🧪 How to Test

1.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
2.  Wait for the status indicator to turn **Green** (System Online).
3.  Type some text into the text area (e.g., "This is a friendly message" or "I hate you").
4.  Click **Analyze Content**.
5.  Watch the card appear instantly in the Live Feed with the AI's classification!

## 📂 Project Structure

```
├── apps
│   ├── api          # Express API Gateway
│   ├── web          # Next.js Frontend
│   └── worker       # Background Processing Service
├── packages
│   └── database     # Shared Prisma/DB configuration
└── docker-compose.yml # Infrastructure definition
```

---
Built with ❤️ using modern web technologies.
