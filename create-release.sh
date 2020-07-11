#!/usr/bin/env bash

rm -f ./release/be.jeroenvdb.googlemeet.streamDeckPlugin

cd ./build

./../DistributionTool -b -i be.jeroenvdb.googlemeet.sdPlugin -o ./../release
