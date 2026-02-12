#!/bin/bash

# Script to create test drops for the sneaker drop system

API_URL="http://localhost:3000"

echo "🚀 Creating test sneaker drops..."

# Drop 1: Air Jordan 1
curl -X POST "$API_URL/api/drops" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Air Jordan 1 Retro High OG '\''Chicago Lost & Found'\''",
    "description": "The iconic Chicago colorway returns with premium leather and vintage detailing",
    "sku": "AJ1-CHI-2026",
    "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
    "price": 299.99,
    "totalStock": 45,
    "dropStartTime": "2026-02-12T03:00:00Z",
    "dropEndTime": "2026-02-20T23:59:59Z",
    "brand": "Nike",
    "colorway": "Chicago",
    "category": "sneakers",
    "releaseYear": 2026
  }'

echo -e "\n\n"

# Drop 2: Nike Dunk Low
curl -X POST "$API_URL/api/drops" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nike Dunk Low Retro '\''Panda'\''",
    "description": "Classic black and white colorway on the iconic Dunk Low silhouette",
    "sku": "DUNK-PANDA-2026",
    "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80",
    "price": 189.99,
    "totalStock": 12,
    "dropStartTime": "2026-02-12T03:00:00Z",
    "dropEndTime": "2026-02-18T23:59:59Z",
    "brand": "Nike",
    "colorway": "Panda",
    "category": "sneakers",
    "releaseYear": 2026
  }'

echo -e "\n\n"

# Drop 3: Yeezy Boost 350
curl -X POST "$API_URL/api/drops" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Adidas Yeezy Boost 350 V2 '\''Onyx'\''",
    "description": "Minimalist design with premium Primeknit upper and Boost cushioning",
    "sku": "YEEZY-ONYX-2026",
    "imageUrl": "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&auto=format&fit=crop&q=80",
    "price": 359.99,
    "totalStock": 8,
    "dropStartTime": "2026-02-12T03:00:00Z",
    "dropEndTime": "2026-02-15T23:59:59Z",
    "brand": "Adidas",
    "colorway": "Onyx",
    "category": "sneakers",
    "releaseYear": 2026
  }'

echo -e "\n\n"

# Drop 4: New Balance 550
curl -X POST "$API_URL/api/drops" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Balance 550 '\''White Green'\''",
    "description": "Basketball-inspired silhouette with retro vibes and modern comfort",
    "sku": "NB550-WG-2026",
    "imageUrl": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&auto=format&fit=crop&q=80",
    "price": 149.99,
    "totalStock": 24,
    "dropStartTime": "2026-02-12T03:00:00Z",
    "dropEndTime": "2026-02-25T23:59:59Z",
    "brand": "New Balance",
    "colorway": "White Green",
    "category": "sneakers",
    "releaseYear": 2026
  }'

echo -e "\n\n"

# Drop 5: Nike Air Max 1
curl -X POST "$API_URL/api/drops" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nike Air Max 1 '\''86 OG G '\''University Red'\''",
    "description": "Golf-ready version of the original Air Max 1 with premium materials",
    "sku": "AM1-UR-2026",
    "imageUrl": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&auto=format&fit=crop&q=80",
    "price": 229.99,
    "totalStock": 18,
    "dropStartTime": "2026-02-12T03:00:00Z",
    "dropEndTime": "2026-02-22T23:59:59Z",
    "brand": "Nike",
    "colorway": "University Red",
    "category": "sneakers",
    "releaseYear": 2026
  }'

echo -e "\n\n"

# Drop 6: Converse Chuck 70
curl -X POST "$API_URL/api/drops" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Converse Chuck 70 High '\''Parchment'\''",
    "description": "Premium canvas construction with vintage details and enhanced comfort",
    "sku": "CHUCK70-PARCH-2026",
    "imageUrl": "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400&auto=format&fit=crop&q=80",
    "price": 99.99,
    "totalStock": 67,
    "dropStartTime": "2026-02-12T03:00:00Z",
    "dropEndTime": "2026-03-01T23:59:59Z",
    "brand": "Converse",
    "colorway": "Parchment",
    "category": "sneakers",
    "releaseYear": 2026
  }'

echo -e "\n\n✅ Test drops created successfully!"
