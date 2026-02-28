# Use official Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of source code
COPY . .

RUN npm run build

# Expose app port
EXPOSE 8001

# Start app
CMD ["npm", "start"]