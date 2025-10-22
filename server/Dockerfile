FROM node:20-alpine

# Set working directory
WORKDIR /src

# Copy package files from src subdirectory
COPY src/package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY src/ .

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "dev"]