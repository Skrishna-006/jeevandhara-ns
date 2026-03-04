#!/bin/bash
# Authentication System - Manual Testing Script
# Run this to test backend endpoints

API_URL="http://localhost:8000/api"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_USERNAME="testuser_$(date +%s)"
TEST_PASSWORD="TestPass123!"

echo "================================"
echo "Authentication System Tests"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register with valid data
echo -e "${YELLOW}TEST 1: Register with valid data${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/register/" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_USERNAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"password_confirm\": \"$TEST_PASSWORD\"
  }")

if echo "$RESPONSE" | grep -q "Registration successful"; then
  echo -e "${GREEN}✓ PASS: Registration successful${NC}"
  echo "Response: $RESPONSE"
else
  echo -e "${RED}✗ FAIL: Registration failed${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 2: Login with valid credentials
echo -e "${YELLOW}TEST 2: Login with valid credentials${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/login/" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "access"; then
  echo -e "${GREEN}✓ PASS: Login successful, JWT token received${NC}"
  echo "Response: $LOGIN_RESPONSE"
  
  # Extract token for later use
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
else
  echo -e "${RED}✗ FAIL: Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
fi
echo ""

# Test 3: Register with duplicate email
echo -e "${YELLOW}TEST 3: Register with duplicate email (should fail)${NC}"
DUP_RESPONSE=$(curl -s -X POST "$API_URL/register/" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser_dup\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"password_confirm\": \"$TEST_PASSWORD\"
  }")

if echo "$DUP_RESPONSE" | grep -q "already registered"; then
  echo -e "${GREEN}✓ PASS: Duplicate email prevented${NC}"
  echo "Response: $DUP_RESPONSE"
else
  echo -e "${RED}✗ FAIL: Duplicate email not prevented${NC}"
  echo "Response: $DUP_RESPONSE"
fi
echo ""

# Test 4: Login with invalid credentials
echo -e "${YELLOW}TEST 4: Login with invalid credentials (should fail)${NC}"
INVALID_LOGIN=$(curl -s -X POST "$API_URL/login/" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_EMAIL\",
    \"password\": \"wrongpassword\"
  }")

if echo "$INVALID_LOGIN" | grep -q "Invalid email or password"; then
  echo -e "${GREEN}✓ PASS: Invalid credentials rejected${NC}"
  echo "Response: $INVALID_LOGIN"
else
  echo -e "${RED}✗ FAIL: Invalid credentials not properly rejected${NC}"
  echo "Response: $INVALID_LOGIN"
fi
echo ""

# Test 5: Password mismatch
echo -e "${YELLOW}TEST 5: Register with mismatched passwords (should fail)${NC}"
MISMATCH=$(curl -s -X POST "$API_URL/register/" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser_mismatch\",
    \"email\": \"test_mismatch@example.com\",
    \"password\": \"Password123!\",
    \"password_confirm\": \"DifferentPass123!\"
  }")

if echo "$MISMATCH" | grep -q "Passwords do not match"; then
  echo -e "${GREEN}✓ PASS: Password mismatch detected${NC}"
  echo "Response: $MISMATCH"
else
  echo -e "${RED}✗ FAIL: Password mismatch not detected${NC}"
  echo "Response: $MISMATCH"
fi
echo ""

# Test 6: Check role in login response
echo -e "${YELLOW}TEST 6: Check role in login response${NC}"
ROLE_RESPONSE=$(curl -s -X POST "$API_URL/login/" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$ROLE_RESPONSE" | grep -q '"role"'; then
  ROLE=$(echo "$ROLE_RESPONSE" | grep -o '"role":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✓ PASS: Role returned in response${NC}"
  echo "Role: $ROLE"
  echo "Response: $ROLE_RESPONSE"
else
  echo -e "${RED}✗ FAIL: Role not returned${NC}"
  echo "Response: $ROLE_RESPONSE"
fi
echo ""

echo "================================"
echo "Testing Complete!"
echo "================================"
echo ""
echo "Summary:"
echo "If all tests passed (✓), the authentication system is working correctly."
echo "If any tests failed (✗), check the error messages above."
echo ""
echo "Next: Test frontend registration and login flows at http://localhost:5173"
