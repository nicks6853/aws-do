#!/bin/bash

set -e

echo "Building Binary of do"
cd bin
rm "do"
pkg ../ --targets node12-macos-x64
cd -
echo "Done."
