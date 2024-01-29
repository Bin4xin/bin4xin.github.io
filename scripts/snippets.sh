#!/bin/bash

version_check(){
  # check version of website.
  web_version=$(grep web_version _config.yml| awk -F':' '{print $2}'| tr -d ' ')
  # use awk write $web_version into README.md
  echo "[LOG]: config file version: '$web_version'"
  old_web_version=$(grep "Power by Bin4xin" README.md|awk -F' ' '{print $3}')
  echo "[LOG]: README version: '$old_web_version'"

  if [ "$old_web_version" != "$web_version" ];then
    echo "[LOG]: diff version detected."
    tmpfileContent=$(sed "s/$old_web_version/$web_version/g" README.md)
    echo "$tmpfileContent" > README.md
    echo "[LOG]: Success write into new web version."
  else
    echo "[LOG]: No diff in version, \$version_check passing."
    return
  fi
}

## TODO
## repo_tag_check, maybe could detected repo articles tags by bash script.
repo_tag_check(){
  return
}

version_check