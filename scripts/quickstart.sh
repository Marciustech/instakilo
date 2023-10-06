#!/bin/bash

RED='\033[31m'
RESET='\033[0m'

#Check for .env file
if [ ! -f .env ]; then
  echo -e "${RED}env file does not exist in the current directory. Exiting...${RESET}"
  exit 1
fi

# Function to handle errors
throw_error() {
  echo -e "${RED}Error: $1" >&2&"${RESET}"
  exit 1
}

# Install dependencies
yarn install || throw_error "Failed to install dependencies"

# Start Docker
docker compose up -d || throw_error "Failed to start Docker Compose"

# Generate Prisma and deploy Prisma migrations
yarn prisma generate --schema=./src/modules/user/prisma/schema.prisma || throw_error "Failed to generate Prisma client"
yarn prisma migrate deploy --schema=./src/modules/user/prisma/schema.prisma || throw_error "Failed to deploy Prisma migrations"

# Build the project
yarn run build || throw_error "Failed to build the project"
