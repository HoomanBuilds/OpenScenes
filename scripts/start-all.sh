#!/bin/bash

echo "Starting Clarity development environment..."
echo ""

npm run dev &
DEV_PID=$!

sleep 3

npm run worker:render &
RENDER_PID=$!

npm run worker:ai &
AI_PID=$!

trap "echo 'Stopping all services...'; kill $DEV_PID $RENDER_PID $AI_PID 2>/dev/null; exit" SIGINT SIGTERM

echo ""
echo "All services started:"
echo "  - Next.js dev server (PID: $DEV_PID) -> http://localhost:3000/projects"
echo "  - Render worker (PID: $RENDER_PID)"
echo "  - AI worker (PID: $AI_PID)"
echo ""
echo "Press Ctrl+C to stop all services"

wait
