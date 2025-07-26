#!/bin/bash

# Portal Service Bus Package Publish Script

set -e

echo "🚀 Publishing @agentverse/service-bus-portal..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the package directory."
    exit 1
fi

# Clean and build
echo "📦 Building package..."
pnpm clean
pnpm build

# Check if build was successful
if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: Build failed. dist/index.js not found."
    exit 1
fi

echo "✅ Build successful!"

# Check if we should publish
read -p "🤔 Do you want to publish to npm? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Publishing to npm..."
    npm publish --access public
    echo "✅ Published successfully!"
else
    echo "⏭️  Skipped publishing."
fi

echo "🎉 Done!" 