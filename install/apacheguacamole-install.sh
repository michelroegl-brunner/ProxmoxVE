#!/usr/bin/env bash


#Copyright (c) 2021-2024 community-scripts ORG
# Author: Michel Roegl-Brunner (michelroegl-brunner)
# License: MIT
# https://github.com/community-scripts/ProxmoxVE/raw/main/LICENSE


source /dev/stdin <<<"$FUNCTIONS_FILE_PATH"
color
verb_ip6
catch_errors
setting_up_container
network_check
update_os

msg_info "Installing Dependencies"
$STD apt-get install -y \
   build-essential \ 
   libcairo2-dev \
   libjpeg-turbo62-dev \
   libpng-dev \
   libtool-bin \
   libossp-uuid-dev \
   libvncserver-dev \
   freerdp2-dev \
   libssh2-1-dev \
   libtelnet-dev \
   libwebsockets-dev \
   libpulse-dev \
   libvorbis-dev \
   libwebp-dev \
   libssl-dev \
   libpango1.0-dev \
   libswscale-dev \
   libavcodec-dev \
   libavutil-dev \
   libavformat-dev
msg_ok "Installed Dependencies"


msg_info "Installing Apache Guacamole"

REALESE=$(curl -sL https://api.github.com/repos/apache/guacamole-server/tags | jq -r '.[0].zipball_url')
mkdir /opt/${APPLICATION}
$STD wget https://api.github.com/repos/apache/guacamole-server/zipball/refs/tags/ -p /opt/${APPLICATION}
cd /opt/${APPLICATION}
tar -xvf guacamole-server.${REALESE}.tar.gz
cd guacamole-server.${REALESE}.tar.gz
./configure --with-init-dir=/etc/init.d --enable-allow-freerdp-snapshots
make
make install
ldconfig
systemctl daemon-reload
systemctl enable --now guacd
mkdir -p /opt/guacamole/{extensions,lib}



motd_ssh
customize

msg_info "Cleaning up"
$STD apt-get -y autoremove
$STD apt-get -y autoclean
msg_ok "Cleaned"
