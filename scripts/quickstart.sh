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

# Build the project
yarn run build || throw_error "Failed to build the project"

# Build the project
nest build || throw_error "Failed to build the project"