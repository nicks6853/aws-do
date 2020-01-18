#!/bin/bash

set -e

npm install

echo "Building Binary of aws-do"
if [ ! -d "./bin" ]; then
    echo "Creating bin/ dir"
    mkdir bin
fi

cd bin
rm -f './aws-do'
pkg ../ --targets node12-linux-x64
cd -
echo "Done."
