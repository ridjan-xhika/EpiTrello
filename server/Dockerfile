FROM node:20-alpine

WORKDIR /src

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ .

EXPOSE 5000

CMD ["npm", "run", "dev"]
