# Use Node.js as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install bun (since the project uses bun)
RUN npm install -g bun

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Set the command to run the application
CMD ["node", "dist/run.js"]

# Expose port if needed (adjust according to your needs)
# EXPOSE 3000 