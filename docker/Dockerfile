# Dockerfile for React Vite Project

# STAGE 1: Build the React application
FROM node:22-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# Using 'ci' is often faster and more reliable for CI/CD environments
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
# This will create a 'dist' folder with the production-ready files
RUN npm run build

# STAGE 2: Serve the application using a lightweight web server
FROM nginx:stable-alpine

# Copy the build output from the builder stage
# The 'dist' folder contains all the static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the nginx configuration file
# This is optional, but recommended for handling client-side routing
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Expose port 80 to the outside world
EXPOSE 80

# Command to run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
