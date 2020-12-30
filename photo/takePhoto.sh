#!/bin/bash

directory="/var/www/html/photo/"
name=$1

/usr/local/bin/gphoto2 --capture-image-and-download --filename $directory$name.jpg
