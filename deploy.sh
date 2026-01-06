#!/bin/bash

# GitHub Pages Deployment Script
# This script helps you deploy your website to GitHub Pages

echo "🚀 GitHub Pages Deployment Setup"
echo ""

# Check if repository name is provided
if [ -z "$1" ]; then
    echo "Usage: ./deploy.sh <repository-name>"
    echo ""
    echo "Example: ./deploy.sh my-website"
    echo ""
    echo "This will create a repository at: https://github.com/YOUR_USERNAME/my-website"
    echo "And your site will be available at: https://YOUR_USERNAME.github.io/my-website"
    exit 1
fi

REPO_NAME=$1
GITHUB_USER=$(git config user.name)

if [ -z "$GITHUB_USER" ]; then
    echo "⚠️  Git user.name not set. Please run:"
    echo "   git config --global user.name 'Your Name'"
    echo "   git config --global user.email 'your.email@example.com'"
    exit 1
fi

echo "Repository name: $REPO_NAME"
echo "GitHub username: $GITHUB_USER"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   Visit: https://github.com/new"
echo "   Repository name: $REPO_NAME"
echo "   Make it PUBLIC (required for free GitHub Pages)"
echo "   DO NOT initialize with README, .gitignore, or license"
echo ""
echo "2. After creating the repository, run these commands:"
echo ""
echo "   git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to: https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
echo "   - Under 'Source', select 'Deploy from a branch'"
echo "   - Select branch: 'main'"
echo "   - Select folder: '/' (root)"
echo "   - Click 'Save'"
echo ""
echo "4. Your website will be available at:"
echo "   https://$GITHUB_USER.github.io/$REPO_NAME"
echo ""
echo "   (It may take a few minutes for the site to go live)"
echo ""
