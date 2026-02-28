# Use official Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json __test__ ./

# Install dependencies
RUN npm install

# Start app
CMD ["npm", "run", "test"]