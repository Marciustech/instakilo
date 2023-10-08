#!/bin/bash

echo "Running User Microservice Build..."

RED='\033[31m'
RESET='\033[0m'

# Function to handle errors
throw_error() {
  echo -e "${RED}Error: $1" >&2&"${RESET}"
  exit 1
}

# Install dependencies
yarn install || throw_error "Failed to install dependencies"

# Generate Prisma and deploy Prisma migrations
yarn prisma generate --schema=./src/prisma/schema.prisma || throw_error "Failed to generate Prisma client"
yarn prisma migrate deploy --schema=./src/prisma/schema.prisma || throw_error "Failed to deploy Prisma migrations"

# Build the project
nest build || throw_error "Failed to build the project"
