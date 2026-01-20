# 🛡️ Real-Time AI-Powered Content Moderation API Gateway

A robust, event-driven full-stack application that provides real-time content moderation using Google's Gemini AI. This system is designed to be scalable, responsive, and easy to integrate, making it perfect for platforms requiring instant content safety checks.

![Project Logo](./apps/web/public/logo.png)

## 💡 Rationale: Why this exists?

In the modern digital age, User-Generated Content (UGC) is the lifeblood of platforms like social media, forums, and gaming. However, this freedom comes with a significant challenge: **Toxicity**.

### The Problem
1.  **Scale**: Big platforms receive millions of messages per second. Manual review is impossible.
2.  **Latency**: Users expect instant interaction. Traditional moderation pipelines are often slow batch processes.
3.  **Context**: Keyword filtering (regex) is easily bypassed and fails to understand nuance (e.g., sarcasm vs. hate speech).
4.  **Burnout**: Human moderators suffer from mental health issues due to constant exposure to toxic content.

### The Solution
This application solves these problems by combining **Event-Driven Architecture** with **Generative AI**:
-   **Asynchronous Processing**: Using **Apache Kafka**, we decouple the user-facing API from the heavy AI processing. This ensures the UI never freezes, even if millions of requests flood in.
-   **AI Understanding**: Instead of simple keywords, we use **Google Gemini AI** to understand the *intent* and *sentiment* of the text, catching subtle toxicity that regex misses.
-   **Real-Time Feedback**: By leveraging **Redis Pub/Sub** and **WebSockets**, we provide instant feedback to the user, educating them immediately if their content is flagged.

## 🌍 Impact on Big Tech Platforms

Implementing a system like this at scale (e.g., for Meta, X, or Discord) has profound impacts:
1.  **Safer Communities**: Proactive removal of hate speech and harassment creates a welcoming environment for diverse users.
2.  **Brand Safety**: Advertisers avoid platforms overrun with toxicity. Automated moderation protects revenue streams.
3.  **Operational Efficiency**: AI handles 99% of the volume, allowing human moderators to focus only on complex edge cases, reducing burnout and cost.
4.  **Legal Compliance**: Helps platforms comply with regulations like the EU's Digital Services Act (DSA) by ensuring rapid action on illegal content.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15, Tailwind CSS, Socket.io Client
-   **Backend**: Node.js, Express, Socket.io Server
-   **Messaging**: Apache Kafka (Confluent Cloud)
-   **Caching/PubSub**: Redis (Upstash)
-   **AI**: Google Gemini Pro
-   **Database**: PostgreSQL (Neon), Prisma ORM
-   **DevOps**: Docker, Turborepo, Vercel, Render

## 🏗️ Architecture

1.  **User** submits content -> **API Gateway**
2.  **API Gateway** pushes event to **Kafka** -> Returns "Pending" ID
3.  **Worker Service** consumes event -> Calls **Gemini AI**
4.  **Worker Service** saves result to **Postgres** -> Publishes to **Redis**
5.  **API Gateway** subscribes to **Redis** -> Pushes via **WebSocket** -> **Frontend**

## 🏁 Getting Started

### Prerequisites
-   Node.js v18+
-   Docker (for local infra)
-   Google Gemini API Key

### Installation

1.  **Clone & Install**:
    ```bash
    git clone <repo-url>
    npm install
    ```

2.  **Environment Setup**:
    -   Copy `.env.example` to `.env` in `apps/api` and `apps/worker`.
    -   Add your `GEMINI_API_KEY` in `apps/worker/.env`.

3.  **Run Locally**:
    ```bash
    # Start Kafka, Redis, Postgres
    docker-compose up -d

    # Start all services
    npm run dev -w apps/api
    npm run dev -w apps/worker
    npm run dev -w apps/web
    ```

---
Built with ❤️ by Shivang Soni
