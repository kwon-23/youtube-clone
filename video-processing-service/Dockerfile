# :: SIMPE VERSION OF THE DOCKERFILE:: 
## Use an official Node runtime as a parent image
#FROM node:18
#
# Set the working directory in the container to /app
# Docker images can be used to instantiate containers
#WORKDIR /app
#
## Install ffmpeg in the container
#RUN apt-get update && apt-get install -y ffmpeg
#
## Copy package.json and package-lock.json into the working directory
#COPY package*.json ./
#
## Install any needed packages specified in the package.json
#RUN npm install
#
## Copy app source inside the docker image
#COPY ..
#
## Make port 3000 available outside this container
## By default, our code runs on the port 3000, but it may not be available to the container unless
## it is exposed
#EXPOSE 3000
#
## Define the command to run your app using CMD (only one CMD allowed)
#CMD [ "npm", "start"]

# Stage 1: Build stage
FROM node:18 AS builder

# Set the working directory
WORKDIR /app

# Copy package*.json files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy other source code files
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production stage
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package*.json files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the listening port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]

