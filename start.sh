#!/bin/bash

# --- Server ---
echo "Starting server..."
node server/index.js &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# --- Client ---
echo "Starting client..."
cd client
npm start &
CLIENT_PID=$!
echo "Client started with PID: $CLIENT_PID"

# --- Wait for processes to exit ---
# Wait for any process to exit
wait -n

# --- Cleanup ---
# When one process exits, kill the other
kill $SERVER_PID $CLIENT_PID 2>/dev/null
echo "Both processes have been terminated."
