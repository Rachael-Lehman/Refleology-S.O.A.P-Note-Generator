# Stage 1: Build Svelte frontend
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Node
FROM node:18
WORKDIR /app

# Copy all files from builder
COPY --from=builder /app /app

# Install only production dependencies
RUN npm install --omit=dev

# Expose port (same as your server.js)
EXPOSE 3000

CMD ["node", "server.js"]
