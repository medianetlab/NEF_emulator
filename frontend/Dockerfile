# Use official Node.js image as a base
FROM node:17-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire frontend directory to the working directory
COPY . .

# Build the React app
RUN npm run build

# Set environment variable to serve app on port 80
ENV PORT=80

# Expose port 80
EXPOSE 80

# Command to run the app
CMD ["npm", "start"]
