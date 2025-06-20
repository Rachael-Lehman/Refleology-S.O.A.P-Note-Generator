# Use an official Node.js runtime as a base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your app source code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Set environment variables (optional, but usually passed at runtime)
# ENV NODE_ENV=production

# Command to run your app
CMD ["node", "server.js"]
