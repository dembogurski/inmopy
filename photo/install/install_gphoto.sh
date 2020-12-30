#!/bin/bash

yum groupinstall "Development tools"

yum install libltdl libtool libtool-ltdl-devel libpopt gcc libusb libusb-devel.x86_64 popt.x86_64 popt.i686 popt-devel.i686 popt-devel.x86_64 popt-static.x86_64

cd /opt
mkdir gphoto2
cd gphoto2
wget /var/www/html/tools/Linux_PC/MaquinaFotos/gphoto2-2.5.10.tar.bz2
tar jxf gphoto2-2.5.10.tar.bz2
wget /var/www/html/tools/Linux_PC/MaquinaFotos/libgphoto2-2.5.10.tar.bz2
tar jxf libgphoto2-2.5.10.tar.bz2


# ingresar en cada uno ejecutar ./configure si no hay errores, luego make y make install