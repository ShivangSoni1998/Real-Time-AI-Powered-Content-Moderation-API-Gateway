# Real-Time AI Content Moderation System

A high-throughput, event-driven API Gateway that uses AI to moderate user-generated content in real-time.

## Architecture

- **API Gateway:** Node.js/Express with Redis Rate Limiting.
- **Message Broker:** Apache Kafka for asynchronous processing.
- **Worker Service:** Consumes messages and uses Google Gemini AI for classification.
- **Database:** PostgreSQL for persistence.
- **Dashboard:** Next.js for real-time monitoring.

## Getting Started

1. **Start Infrastructure:**
   ```bash
   docker-compose up -d
   ```

2. **Install Dependencies:**
   (Instructions to follow)
