FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source
COPY . .

# Create volume for persistence
VOLUME ["/usr/src/app/data"]

# Create logs directory
RUN mkdir -p logs

# Expose ports
EXPOSE 3000
EXPOSE 4001
EXPOSE 4002/udp

# Start the application
CMD ["npm", "start"]