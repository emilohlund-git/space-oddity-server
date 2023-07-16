#!/bin/bash

# Get the current branch name
current_branch=$(git symbolic-ref --short HEAD)

# Switch to the main branch
git checkout main

# Delete all local branches except main
for branch in $(git branch --format="%(refname:short)" | grep -v "main"); do
  git branch -D $branch
done

# Switch back to the original branch
git checkout $current_branch