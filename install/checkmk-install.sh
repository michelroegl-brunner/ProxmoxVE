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

msg_info "Install Dependencies"
$STD apt-get install -y curl
msg_ok "Install Dependencies"

msg_info "Setup Checkmk"
#RELEASE=$(curl -s https://checkmk.com/download/archive | grep -oP 'handle="\K[^"]+' | head -n 1)
RELEASE=2.3.0p20
wget -q https://download.checkmk.com/checkmk/${RELEASE}/check-mk-raw-${RELEASE}_0.bookworm_amd64.deb
$STD apt-get install -y ./check-mk-raw-${RELEASE}_0.bookworm_amd64.deb
echo "${RELEASE}" >"/opt/checkmk/${APPLICATION}_version.txt"
msg_ok "Setup Checkmk"

read -r -p "What should your monitoring site be called?" SITENAME
msg_info "Setup Service\n"
$STD omd create ${SITENAME}
PASS=$(openssl rand -base64 18 | tr -dc 'a-zA-Z0-9' | head -c13)
su - $SITENAME -c "echo $PASS | cmk-passwd --stdin cmkadmin"
{
    echo "Checkmk-Credentials"
    echo "Checkmk User: cmkadmin"
    echo "Checkmk Password: ${PASS}"
    echo "Checkmk Site: ${SITENAME}"
} >> ~/checkmk.creds
$STD omd start ${SITENAME}
msg_ok "Setup Service"

motd_ssh
customize

msg_info "Cleaning up"
rm -rf /opt/v${RELEASE}.zip
$STD apt-get -y autoremove
$STD apt-get -y autoclean
msg_ok "Cleaned"
