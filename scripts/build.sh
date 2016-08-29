#!/bin/bash
# Build the project either locally or remotely (requires mounted filesystem via ssh)

cmd="babel";
srcDir="./src";
presets="@woodywoodsta/babel-preset-node";

case $1 in
  local ) outDir="./build";;
  remote ) outDir="/home/sean/edisonSSH/rce/mars-rover-rce/build";;
  * ) echo "Please specify output type [ local | remote ]"; exit ;;
esac

if [[ $# == 2 ]]; then
  watchParam=$2;
elif [[ $# == 3 ]]; then
  watchParam=$3;
fi

if [[ $watchParam != "-w" ]]; then
  watchParam="";
fi

echo "Building to $1 directory...";

# Run the build
cmdLine="echo $PWD && ${cmd} ${srcDir} --presets ${presets} -d ${outDir} ${watchParam}";

eval $cmdLine
