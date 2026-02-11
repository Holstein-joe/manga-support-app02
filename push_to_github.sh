#!/bin/bash
# Try to kill any running node processes to free the terminal
killall node >/dev/null 2>&1 || echo "No node process to kill"

# Stop on error
set -e

# Execute the git commands
echo "Initializing Git repository..."
git config --global user.name "Holstein-joe"
git config --global user.email "holstein-joe@example.com"
git init -b main
git add .

# Ignore the script file itself
git reset push_to_github.sh >/dev/null 2>&1 || echo "Script not staged"

# Check if there are changes to commit
if ! git diff-index --quiet HEAD; then
  echo "Committing changes..."
  git commit -m "Feat: Initial project setup with all fixes"
else
  echo "No changes to commit."
fi

# Check if remote already exists
if git remote | grep -q 'origin'; then
  git remote set-url origin https://github.com/Holstein-joe/manga-support-app02.git
else
  git remote add origin https://github.com/Holstein-joe/manga-support-app02.git
fi

echo "Pushing to GitHub..."
git push -u -f origin main

echo "Push to GitHub successful!"
