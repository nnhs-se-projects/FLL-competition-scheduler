#!/bin/bash

# FLL Competition Scheduler - Run Script
# 
# This script runs the FLL Competition Scheduler application.

# Change to the project root directory
cd "$(dirname "$0")/.."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please create a .env file with the required environment variables."
  echo "See .env.example for reference."
  exit 1
fi

# Run the application
echo "Starting FLL Competition Scheduler..."
node index.js 