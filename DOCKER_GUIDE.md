# Docker Deployment Guide - AI Prompt Builder

## Overview

This guide explains how to containerize and deploy the AI Prompt Builder using Docker and Docker Compose.

## Architecture

The Docker setup includes three services:

1. **MongoDB** - Data persistence (mongo:7-alpine)
2. **Backend** - Express.js API (Node.js 20-alpine)
3. **Frontend** - React SPA served by Nginx (nginx:alpine)

All services communicate over a Docker bridge network.

## Prerequisites

- Docker installed (https://docs.docker.com/get-docker/)
- Docker Compose installed (included in Docker Desktop)
- API keys for AI services (Groq, Hugging Face, Gemini, etc.)

## Quick Start

### 1. Clone and Navigate
```bash
cd ai-prompt-builder
```

### 2. Create Environment File
```bash
cp .env.example .env
```

Then edit `.env` and add your actual API keys:
```bash
nano .env
```

### 3. Build and Start Services
```bash
# Build images and start all services
docker-compose up -d

# View logs from all services
docker-compose logs -f

# View logs from a specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## Useful Commands

### Start Services
```bash
docker-compose up                  # Start in foreground
docker-compose up -d              # Start in background
```

### Stop Services
```bash
docker-compose down               # Stop and remove containers (keep volumes)
docker-compose down -v            # Stop and remove containers + volumes
```

### View Logs
```bash
docker-compose logs -f            # Follow logs from all services
docker-compose logs -f backend    # Follow backend logs only
docker-compose ps                 # Show running containers
```

### Rebuild Images
```bash
docker-compose up -d --build      # Rebuild images and start
docker-compose build              # Rebuild without starting
```

### Access Container Shell
```bash
docker-compose exec backend sh    # Access backend container
docker-compose exec frontend sh   # Access frontend container
docker-compose exec mongo mongosh # Access MongoDB shell
```

## File Structure

```
ai-prompt-builder/
├── docker-compose.yml            # Main Docker Compose configuration
├── .env.example                  # Template for environment variables
├── .env                          # Your actual API keys (create from .env.example)
├── ai-prompt-builder-backend/
│   ├── Dockerfile               # Backend Docker image definition
│   ├── .dockerignore           # Files to exclude from Docker build
│   └── server.js               # Express.js entry point
└── ai-prompt-builder-frontend/
    ├── Dockerfile              # Frontend Docker image definition
    ├── .dockerignore          # Files to exclude from Docker build
    ├── nginx.conf             # Nginx configuration
    └── public/index.html      # React entry point
```

## Environment Variables

### Backend (.env file)
The backend service reads from the `.env` file:

```env
MONGO_URI=mongodb://mongo:27017/ai-prompt-builder
PORT=5000
JWT_SECRET=your-secret-key
OPENAI_API_KEY=...
HUGGINGFACE_TOKEN=...
GROQ_API_KEY=...
GEMINI_API_KEY=...
MISTRAL_API_KEY=...
```

Note: In docker-compose.yml, `MONGO_URI` is automatically set to the internal Docker hostname (`mongo:27017`). The `.env` file overrides are used for API keys.

### Frontend (Environment variables)
Set in `docker-compose.yml`:
```yaml
REACT_APP_BACKEND_URL: http://localhost:5000
REACT_APP_FRONTEND_API_URL: http://localhost:5000/api
```

## Production Deployment

For production, make these changes:

### 1. Security Updates

```yaml
# In docker-compose.yml - Enable MongoDB authentication:
mongo:
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
```

### 2. Update CORS Settings

Edit [ai-prompt-builder-backend/server.js](ai-prompt-builder-backend/server.js):
```javascript
const allowedOrigins = [
  'https://your-production-domain.com',
  'http://localhost:3000',
];
```

### 3. Environment Configuration

```bash
# Create production .env file
cp .env.example .env.production

# Update with production values:
# - Real API keys
# - Strong JWT_SECRET
# - Production URLs
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_FRONTEND_API_URL=https://yourdomain.com/api
```

### 4. Use Docker Secrets (for sensitive data)
```yaml
# In production, use Docker secrets instead of .env files
services:
  backend:
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
secrets:
  jwt_secret:
    external: true
```

### 5. Reverse Proxy (Optional - for production)

Consider using Traefik or Nginx reverse proxy in front of your services:
- SSL/TLS termination
- Load balancing
- Domain routing

## Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose logs

# Check health status
docker-compose ps
```

### Backend Can't Connect to MongoDB
```bash
# Ensure mongo service is healthy first
docker-compose logs mongo

# Verify network connectivity
docker-compose exec backend ping mongo
```

### Frontend Shows Blank Page
```bash
# Check if Nginx is running
docker-compose logs frontend

# Verify backend is accessible
docker-compose exec frontend wget -O- http://backend:5000/
```

### Port Already in Use
```bash
# Change port in docker-compose.yml:
# ports:
#   - "8000:5000"  # Use 8000 instead of 5000
```

## Database Migration

If you need to migrate data from local MongoDB to Docker:

```bash
# Export from local
mongodump --uri "mongodb://localhost:27017/ai-prompt-builder" --out ./dump

# Import to Docker container
docker-compose exec mongo mongorestore --uri "mongodb://mongo:27017/ai-prompt-builder" ./dump
```

## Scaling

To run multiple instances of backend:
```bash
docker-compose up --scale backend=3
```

Note: You'll need a load balancer (like Nginx) in front for this to work effectively.

## Cleanup

```bash
# Remove all containers and volumes
docker-compose down -v

# Remove dangling images
docker image prune -f

# Remove all unused resources
docker system prune -af
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Verify API keys are set correctly in `.env`
3. Ensure MongoDB is healthy: `docker-compose ps`
4. Check CORS settings if frontend can't reach backend
