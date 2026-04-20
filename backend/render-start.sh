#!/bin/bash
# Render start script

echo "Starting Spring Boot application..."

# Find the JAR file
JAR_FILE=$(find target -name "*.jar" | head -n 1)

if [ -z "$JAR_FILE" ]; then
    echo "Error: No JAR file found in target directory"
    exit 1
fi

echo "Found JAR file: $JAR_FILE"

# Start the application with prod profile
java -Dserver.port=$PORT -Dspring.profiles.active=prod -jar $JAR_FILE
