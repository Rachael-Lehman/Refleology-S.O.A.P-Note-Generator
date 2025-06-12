# My Project Name
This is a full-stack application with a Svelte frontend and an Express backend.
The frontend and backend are deployed separately and communicate via HTTP API.

## Folder Structure

- `/frontend` – SvelteKit or Vite-based frontend
- `/backend` – Node.js + Express backend API

## Frontend

- Built with: Svelte, Tailwind CSS, Flowbite
- Runs on: Vite

### Local Setup

```bash
cd front
npm install
npm run dev


# Stage 1: Build Svelte frontend
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Node
FROM node:20
WORKDIR /app

# Copy all files from builder
COPY --from=builder /app /app

# Install only production dependencies
RUN npm install --omit=dev

# Expose port (same as your server.js)
EXPOSE 3000

CMD ["node", "server.js"]
