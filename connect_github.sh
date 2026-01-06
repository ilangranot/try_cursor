#!/bin/bash

# Connect to GitHub and push code
# Run this AFTER creating the repository on GitHub

echo "🔗 Connecting to GitHub repository..."
echo ""

# Add remote origin
git remote add origin https://github.com/ilangranot/try_cursor.git 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Remote added successfully"
elif [ $? -eq 128 ]; then
    echo "⚠️  Remote already exists, updating..."
    git remote set-url origin https://github.com/ilangranot/try_cursor.git
    echo "✅ Remote updated"
else
    echo "❌ Error adding remote"
    exit 1
fi

echo ""
echo "📤 Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your code has been pushed to GitHub."
    echo ""
    echo "📝 Next step: Enable GitHub Pages"
    echo "   1. Visit: https://github.com/ilangranot/try_cursor/settings/pages"
    echo "   2. Select 'Deploy from a branch'"
    echo "   3. Branch: main, Folder: / (root)"
    echo "   4. Click 'Save'"
    echo ""
    echo "🌐 Your website will be at:"
    echo "   https://ilangranot.github.io/try_cursor"
else
    echo ""
    echo "❌ Error pushing to GitHub"
    echo "   Make sure you've created the repository at:"
    echo "   https://github.com/new"
    echo "   Repository name: try_cursor (PUBLIC)"
    exit 1
fi
