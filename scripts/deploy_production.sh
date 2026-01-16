#!/bin/bash

# Production Deployment Script
# Applies database migrations via Supabase API

set -e

echo "🚀 ARGUS Production Deployment"
echo "================================"
echo ""

# Check environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not set"
    exit 1
fi

echo "✅ Environment variables verified"
echo ""

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')
echo "📦 Project: $PROJECT_REF"
echo ""

echo "📋 Migration Instructions:"
echo "================================"
echo ""
echo "Since Supabase doesn't support direct SQL execution via API,"
echo "please apply migrations manually via Supabase Dashboard:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo ""
echo "2. Copy and paste the following migrations:"
echo ""
echo "   Migration 1: supabase/migrations/002_metadata_logs.sql"
echo "   Migration 2: supabase/migrations/003_api_integration.sql"
echo ""
echo "3. Click 'Run' for each migration"
echo ""
echo "================================"
echo ""
echo "After migrations are complete, verify with:"
echo "  npm run verify-production"
echo ""
