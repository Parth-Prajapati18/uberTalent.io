#!/bin/bash
 
 echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ $VERCEL_GIT_COMMIT_REF == "main" ]] ; then
  echo "Building for Production"
  npm run build:prod
else
  echo "Building for Test"
  npm run build:test
fi