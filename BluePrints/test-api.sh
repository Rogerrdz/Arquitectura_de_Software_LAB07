#!/bin/bash
# Script de prueba de la API Blueprints

BASE_URL="http://localhost:8081/api/v1/blueprints"

echo "======================================"
echo "Testing Blueprints API"
echo "======================================"
echo ""

echo "1. GET all blueprints"
curl -s $BASE_URL | jq
echo ""

echo "2. GET blueprints by author (john)"
curl -s $BASE_URL/john | jq
echo ""

echo "3. GET specific blueprint (john/house)"
curl -s $BASE_URL/john/house | jq
echo ""

echo "4. POST new blueprint (john/kitchen)"
curl -i -X POST $BASE_URL \
  -H 'Content-Type: application/json' \
  -d '{
    "author": "john",
    "name": "kitchen",
    "points": [{"x": 1, "y": 1}, {"x": 2, "y": 2}]
  }'
echo ""

echo "5. Verify the new blueprint was created"
curl -s $BASE_URL/john/kitchen | jq
echo ""

echo "6. PUT add point to blueprint (john/kitchen)"
curl -i -X PUT $BASE_URL/john/kitchen/points \
  -H 'Content-Type: application/json' \
  -d '{"x": 3, "y": 3}'
echo ""

echo "7. Verify point was added"
curl -s $BASE_URL/john/kitchen | jq
echo ""

echo "8. Test error: GET non-existent blueprint"
curl -s $BASE_URL/nonexistent/blueprint | jq
echo ""

echo "9. Test error: POST duplicate blueprint"
curl -i -X POST $BASE_URL \
  -H 'Content-Type: application/json' \
  -d '{
    "author": "john",
    "name": "house",
    "points": [{"x": 1, "y": 1}]
  }'
echo ""

echo "======================================"
echo "Tests completed!"
echo "======================================"
