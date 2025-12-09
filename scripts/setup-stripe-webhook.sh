#!/bin/bash

echo "🔧 Setting up Stripe Webhook for Local Testing..."
echo ""
echo "This script will:"
echo "1. Start Stripe webhook listener"
echo "2. Show you the webhook secret"
echo "3. Help you add it to backend/.env"
echo ""
echo "Press Ctrl+C to stop the listener when done"
echo ""
echo "Starting Stripe webhook listener..."
echo ""

# Start stripe listen and capture the webhook secret
stripe listen --forward-to localhost:3001/api/stripe/webhook 2>&1 | while IFS= read -r line; do
    echo "$line"
    
    # Check if this line contains the webhook secret
    if [[ $line == *"whsec_"* ]]; then
        echo ""
        echo "✅ Webhook secret found!"
        echo ""
        echo "Copy this webhook secret and add it to backend/.env:"
        echo "STRIPE_WEBHOOK_SECRET=$(echo $line | grep -o 'whsec_[^ ]*')"
        echo ""
        echo "Then restart your backend server."
    fi
done

