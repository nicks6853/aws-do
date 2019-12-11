#!/bin/bash

set -e

echo "Building Binary of do"
if [ ! -d "./bin" ]; then
    echo "Creating bin/ dir"
    mkdir bin
fi

cd bin
rm -f './do'
pkg ../ --targets node12-macos-x64
cd -
echo "Done."
