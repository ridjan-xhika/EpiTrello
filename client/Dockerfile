FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files from app subdirectory
COPY app/package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY app/ .

# Expose port
EXPOSE 3000

# Start the application with Vite on port 3000
CMD ["npm", "run", "dev", "--", "--host", "--port", "3000"]