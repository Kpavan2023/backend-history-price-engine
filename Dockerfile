# Use Node.js LTS as the base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the backend files
COPY . .

# Expose backend port
EXPOSE 5000

# Define environment variable for port
ENV PORT=5000

# Start the backend server
CMD ["npm", "start"]
