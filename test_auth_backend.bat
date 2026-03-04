@echo off
REM Authentication System - Manual Testing Script (Windows)
REM Run this to test backend endpoints

setlocal enabledelayedexpansion

set API_URL=http://localhost:8000/api
set TEST_EMAIL=test_%RANDOM%@example.com
set TEST_USERNAME=testuser_%RANDOM%
set TEST_PASSWORD=TestPass123!

echo.
echo ================================
echo Authentication System Tests
echo ================================
echo.

REM Test 1: Register with valid data
echo TEST 1: Register with valid data
curl -X POST "%API_URL%/register/" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"%TEST_USERNAME%\", \"email\": \"%TEST_EMAIL%\", \"password\": \"%TEST_PASSWORD%\", \"password_confirm\": \"%TEST_PASSWORD%\"}"
echo.
echo.

REM Test 2: Login with valid credentials
echo TEST 2: Login with valid credentials
curl -X POST "%API_URL%/login/" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"%TEST_EMAIL%\", \"password\": \"%TEST_PASSWORD%\"}"
echo.
echo.

REM Test 3: Register with duplicate email
echo TEST 3: Register with duplicate email (should fail)
curl -X POST "%API_URL%/register/" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"testuser_dup\", \"email\": \"%TEST_EMAIL%\", \"password\": \"%TEST_PASSWORD%\", \"password_confirm\": \"%TEST_PASSWORD%\"}"
echo.
echo.

REM Test 4: Login with invalid credentials
echo TEST 4: Login with invalid credentials (should fail)
curl -X POST "%API_URL%/login/" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"%TEST_EMAIL%\", \"password\": \"wrongpassword\"}"
echo.
echo.

REM Test 5: Password mismatch
echo TEST 5: Register with mismatched passwords (should fail)
curl -X POST "%API_URL%/register/" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"testuser_mismatch\", \"email\": \"test_mismatch@example.com\", \"password\": \"Password123!\", \"password_confirm\": \"DifferentPass123!\"}"
echo.
echo.

echo ================================
echo Testing Complete!
echo ================================
echo.
echo To verify responses:
echo - Test 1 should show: "Registration successful"
echo - Test 2 should show: "access" token and "role"
echo - Test 3 should show: "already registered" error
echo - Test 4 should show: "Invalid email or password" error
echo - Test 5 should show: "Passwords do not match" error
echo.
echo Next: Test frontend at http://localhost:5173/register
