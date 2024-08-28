#!/bin/bash

root=$(pwd)

packages=$(find packages -maxdepth 2 -name package.json)

echo "Command: $1";
ret_code=0

for package in ${packages}
do
  cd "$root";
  path=${package//package.json/""}
  cd "$path";
  $@;
  ret_code=$?
  if [[ $ret_code -ne 0 ]]; then
    break;
  fi
done

cd "$root";
exit $ret_code;