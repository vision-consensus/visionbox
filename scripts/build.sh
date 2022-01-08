#!/usr/bin/env bash

rm -rf build
node_modules/.bin/babel --minified --source-maps inline --no-comments src -d build
mkdir -p build/components/ContractSchema/spec
cp -r src/components/ContractSchema/spec build/components/ContractSchema/spec
cp scripts/visionbox.js build/.
chmod +x build/visionbox.js
