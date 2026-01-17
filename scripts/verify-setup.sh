#!/bin/bash

# TeamMAE.ai Setup Verification Script
# Checks that all required files and configurations are in place

set -e

echo "🔍 TeamMAE.ai Setup Verification"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
CHECKS_PASSED=0
CHECKS_FAILED=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((CHECKS_FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "📦 Checking files..."
echo ""

# Check .env.example exists
if [ -f ".env.example" ]; then
    check_pass ".env.example exists"
else
    check_fail ".env.example missing"
fi

# Check if .env exists
if [ -f ".env" ]; then
    check_pass ".env file exists"

    # Check for required keys
    if grep -q "VITE_SUPABASE_URL" .env && ! grep -q "VITE_SUPABASE_URL=$" .env; then
        check_pass "VITE_SUPABASE_URL is set"
    else
        check_fail "VITE_SUPABASE_URL not set in .env"
    fi

    if grep -q "VITE_SUPABASE_ANON_KEY" .env && ! grep -q "VITE_SUPABASE_ANON_KEY=$" .env; then
        check_pass "VITE_SUPABASE_ANON_KEY is set"
    else
        check_fail "VITE_SUPABASE_ANON_KEY not set in .env"
    fi

    if grep -q "VITE_ANTHROPIC_API_KEY" .env && ! grep -q "VITE_ANTHROPIC_API_KEY=$" .env; then
        check_pass "VITE_ANTHROPIC_API_KEY is set (optional)"
    else
        check_warn "VITE_ANTHROPIC_API_KEY not set (will use mock builds)"
    fi
else
    check_fail ".env file missing - copy from .env.example"
fi

echo ""
echo "🗄️  Checking database files..."
echo ""

# Check schema file
if [ -f "packages/db/supabase/schema.sql" ]; then
    check_pass "Database schema file exists"
else
    check_fail "Database schema file missing"
fi

# Check migration file
if [ -f "packages/db/supabase/migrations/001_add_build_fields.sql" ]; then
    check_pass "Build fields migration exists"
else
    check_fail "Migration 001_add_build_fields.sql missing"
fi

echo ""
echo "🔧 Checking core files..."
echo ""

# Check auth components
if [ -f "apps/web/src/components/AuthGate.tsx" ]; then
    check_pass "AuthGate component exists"
else
    check_fail "AuthGate component missing"
fi

if [ -f "apps/web/src/components/UserMenu.tsx" ]; then
    check_pass "UserMenu component exists"
else
    check_fail "UserMenu component missing"
fi

# Check project management components
if [ -f "apps/web/src/components/ProjectSelector.tsx" ]; then
    check_pass "ProjectSelector component exists"
else
    check_fail "ProjectSelector component missing"
fi

if [ -f "apps/web/src/components/BuildHistory.tsx" ]; then
    check_pass "BuildHistory component exists"
else
    check_fail "BuildHistory component missing"
fi

# Check Supabase client
if [ -f "apps/web/src/lib/supabase.ts" ]; then
    check_pass "Supabase client exists"
else
    check_fail "Supabase client missing"
fi

# Check helpers
if [ -f "packages/db/src/helpers.ts" ]; then
    check_pass "Database helpers exist"
else
    check_fail "Database helpers missing"
fi

# Check API handler
if [ -f "apps/web/server/api.ts" ]; then
    check_pass "API handler exists"
else
    check_fail "API handler missing"
fi

echo ""
echo "📚 Checking documentation..."
echo ""

if [ -f "PROMPT3_CHANGES.md" ]; then
    check_pass "PROMPT3_CHANGES.md exists"
else
    check_warn "PROMPT3_CHANGES.md missing"
fi

if [ -f "TESTING_GUIDE.md" ]; then
    check_pass "TESTING_GUIDE.md exists"
else
    check_warn "TESTING_GUIDE.md missing"
fi

echo ""
echo "=================================="
echo "📊 Results:"
echo ""
echo -e "${GREEN}✅ Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}❌ Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. If .env is not configured, copy .env.example to .env and fill in your Supabase credentials"
    echo "2. Run the migration in packages/db/supabase/migrations/001_add_build_fields.sql in your Supabase dashboard"
    echo "3. Start the dev server: pnpm dev"
    echo "4. Follow the testing guide in TESTING_GUIDE.md"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Please fix the issues above.${NC}"
    echo ""
    exit 1
fi
