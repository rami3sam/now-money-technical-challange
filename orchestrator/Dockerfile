# Use official Node image
FROM node:20-bullseye

ENV MONGOMS_DOWNLOAD_URL='https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu1804-4.2.8.tgz'

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
EXPOSE 8000

# Start app
CMD ["npm", "start"]