#!/bin/bash

dir='lite-build'

rm -rf $dir

# Build dirs
mkdir -p $dir $dir/public $dir/server $dir/client $dir/shared
npm run build

# Copy Root
cp package.json $dir/package.json

# Copy Server
cp -r server/dist $dir/server/dist
cp server/package.json $dir/server/package.json
cp server/tsconfig.json $dir/server/tsconfig.json

# Copy Client
cp -r client/dist $dir/client/dist
cp client/package.json $dir/client/package.json
cp client/tsconfig.json $dir/client/tsconfig.json

# Copy Shared
cp -r shared/dist $dir/shared/dist
cp shared/package.json $dir/shared/package.json
cp shared/tsconfig.json $dir/shared/tsconfig.json
