#!/bin/sh -x

CURRENT=$(cd $(dirname $0);pwd)

cd $CURRENT
cargo run webapp/src/data/2019/contests.json webapp/src/data/2019/

cd webapp
yarn build
cd ../
mv docs/CNAME ./webapp/build/
rm -rf docs/
mv webapp/build ./docs
