#!/usr/bin/env bash

(
cd packages/visionwrap/visionweb
git reset --hard
git checkout master
git pull origin master
yarn install
yarn build
)
