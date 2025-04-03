# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (force bcrypt rebuild)
RUN npm install && npm rebuild bcrypt --build-from-source

# Copy all files to container
COPY . .

# Expose port (change if needed)
EXPOSE 5000

# Run the application
CMD ["npm", "start"]
