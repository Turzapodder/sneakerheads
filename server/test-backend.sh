#!/bin/bash

echo "🔍 Testing Backend Server..."
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
curl -s http://localhost:3000/health | jq '.'
echo ""

# Test 2: CORS Headers
echo "2️⃣ Testing CORS Headers..."
curl -s -I -X OPTIONS http://localhost:3000/api/auth/me \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization, Content-Type"
echo ""

echo "✅ Tests complete!"
echo ""
echo "📝 If you see CORS errors:"
echo "   1. Check server is running on port 3000"
echo "   2. Check server logs for errors"
echo "   3. Verify .env has CLIENT_URL=http://localhost:5173"
