#!/bin/bash
# Render build script

echo "Starting build process..."

# Make mvnw executable
chmod +x ./mvnw

# Build the project
./mvnw clean package -DskipTests

echo "Build completed successfully!"
