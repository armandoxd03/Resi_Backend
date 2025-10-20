#!/bin/bash

# Script to Set Up Vercel Environment Variables
# This script helps you configure all required environment variables in Vercel

echo "================================================"
echo "  ResiLinked Backend - Vercel Environment Setup"
echo "================================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed!"
    echo "Install it with: npm install -g vercel"
    echo ""
    echo "📖 Alternative: Configure manually at https://vercel.com/dashboard"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Read .env.vercel file
if [ ! -f ".env.vercel" ]; then
    echo "❌ .env.vercel file not found!"
    echo "Make sure you're in the Resi_Backend directory"
    exit 1
fi

echo "📋 This script will add environment variables from .env.vercel to your Vercel project"
echo ""
echo "⚠️  IMPORTANT: This will add variables to PRODUCTION environment"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 0
fi

echo ""
echo "⚙️ Adding environment variables to Vercel..."
echo ""

# Parse .env.vercel and add each variable
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ $key =~ ^#.*$ ]] || [[ -z $key ]]; then
        continue
    fi
    
    # Remove leading/trailing whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    if [[ ! -z $key ]] && [[ ! -z $value ]]; then
        echo "Adding: $key"
        echo "$value" | vercel env add "$key" production --force >/dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "  ✅ Successfully added"
        else
            echo "  ❌ Failed to add"
        fi
    fi
done < .env.vercel

echo ""
echo "================================================"
echo "✅ Environment variables setup complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Redeploy your application: vercel --prod"
echo "  2. Check logs: vercel logs --follow"
echo "  3. Test user registration to verify email sending"
echo ""
