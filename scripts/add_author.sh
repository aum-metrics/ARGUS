#!/bin/bash
# Script to add author attribution to all TypeScript and SQL files
# Author: Sambath Kumar Natarajan

AUTHOR_COMMENT="/**\n * Author: Sambath Kumar Natarajan\n */"
AUTHOR_COMMENT_SQL="--\n-- Author: Sambath Kumar Natarajan\n--"

# Function to add author comment to TypeScript/TSX files
add_author_ts() {
    local file="$1"
    
    # Check if file already has author comment
    if grep -q "Author: Sambath Kumar Natarajan" "$file"; then
        echo "Skipping $file (already has author comment)"
        return
    fi
    
    # Check if file starts with import or export
    if head -n 1 "$file" | grep -qE "^(import|export|'use)"; then
        # Add comment at the top
        echo -e "$AUTHOR_COMMENT\n$(cat "$file")" > "$file"
    else
        # Add comment at the top
        echo -e "$AUTHOR_COMMENT\n$(cat "$file")" > "$file"
    fi
    
    echo "Added author to $file"
}

# Function to add author comment to SQL files
add_author_sql() {
    local file="$1"
    
    # Check if file already has author comment
    if grep -q "Author: Sambath Kumar Natarajan" "$file"; then
        echo "Skipping $file (already has author comment)"
        return
    fi
    
    # Add comment at the top
    echo -e "$AUTHOR_COMMENT_SQL\n$(cat "$file")" > "$file"
    echo "Added author to $file"
}

# Find and process all TypeScript files
find . -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "./node_modules/*" ! -path "./.next/*" ! -name "next-env.d.ts" | while read file; do
    add_author_ts "$file"
done

# Find and process all SQL files
find . -type f -name "*.sql" ! -path "./node_modules/*" ! -path "./.next/*" | while read file; do
    add_author_sql "$file"
done

echo "Done! Author attribution added to all files."
