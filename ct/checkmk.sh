#!/usr/bin/env bash
source <(curl -s https://raw.githubusercontent.com/michelroegl-brunner/ProxmoxVE/refs/heads/dev/misc/build.func)

#Copyright (c) 2021-2024 community-scripts ORG
# Author: Michel Roegl-Brunner (michelroegl-brunner)
# License: MIT
# https://github.com/community-scripts/ProxmoxVE/raw/main/LICENSE
function header_info {
clear
cat <<"EOF"
Checkmk
EOF
}
header_info
echo -e "Loading..."
APP="Checkmk"

var_disk="8"
var_cpu="2"
var_ram="2048"
var_os="debian"
var_version="12"
variables
color
catch_errors

function default_settings() {
  CT_TYPE="1"
  PW=""
  CT_ID=$NEXTID
  HN=$NSAPP
  DISK_SIZE="$var_disk"
  CORE_COUNT="$var_cpu"
  RAM_SIZE="$var_ram"
  BRG="vmbr0"
  NET="dhcp"
  GATE=""
  APT_CACHER=""
  APT_CACHER_IP=""
  DISABLEIP6="no"
  MTU=""
  SD=""
  NS=""
  MAC=""
  VLAN=""
  SSH="no"
  VERB="no"
  echo_default
}

function update_script() {
header_info
check_container_storage
check_container_resources
if [[ ! -d /opt/omd ]]; then msg_error "No ${APP} Installation Found!"; exit; fi
RELEASE=$(curl -s https://checkmk.com/download/archive | grep -oP 'handle="\K[^"]+' | head -n 1)
if [[ ! -f /opt/${APP}_version.txt ]] || [[ "${RELEASE}" != "$(cat /opt/${APP}_version.txt)" ]]; then
SITE=$(grep -oP 'Checkmk Site:\s*\K.*' checkmk.creds)
msg_info "Backup Site: ${SITE} to ${SITE}_BACKUP.tar"
omd stop $SITE &>/dev/null
omd backup $SITE ${SITE}_$(cat /opt/${APP}_version.txt)_BACKUP &>/dev/null
msg_ok "Backup Site: ${SITE} to ${SITE}_BACKUP"

msg_info "Updating ${APP} to v${RELEASE}"
wget -q --directory-prefix=/opt  https://download.checkmk.com/checkmk/${RELEASE}/check-mk-raw-${RELEASE}_0.bookworm_amd64.deb
apt-get install -y /opt/check-mk-raw-${RELEASE}_0.bookworm_amd64.deb &>/dev/null 
echo "${RELEASE}" >"/opt/${APP}_version.txt"
omd su $SITE &>/dev/null
omd update --conflict install &>/dev/null
omd start &>/dev/null
rm /opt/check-mk-raw-${RELEASE}_0.bookworm_amd64.deb &>/dev/null
exit
msg_ok "Updating ${APP} to v${RELEASE}"

else
  msg_ok "No update required. ${APP} is already at v${RELEASE}."
fi
exit
}

start
build_container
description

msg_ok "Completed Successfully!\n"
