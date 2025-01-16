#!/usr/bin/env bash
source <(curl -s https://raw.githubusercontent.com/michelroegl-brunner/ProxmoxVE/refs/heads/DEV/misc/build.func)
# Copyright (c) 2021-2025 community-scripts ORG
# Author: TheRealVira
# License: MIT | https://github.com/community-scripts/ProxmoxVE/raw/main/LICENSE
# Source: https://github.com/mealie-recipes/mealie

# App Default Values
APP="mealie"
var_tags="recipes"
var_cpu="2"
var_ram="2048"
var_disk="6"
var_os="debian"
var_version="12"
var_unprivileged="1"

# App Output & Base Settings
header_info "$APP"
base_settings

# Core
variables
color
catch_errors

function update_script() {
    header_info
    check_container_storage
    check_container_resources

    if [[ ! -d "/opt/${APP}" ]]; then
        msg_error "No ${APP} Installation Found!"
        exit
    fi

    RELEASE=$(curl -s https://api.github.com/repos/mealie-recipes/mealie/releases/latest | grep "tag_name" | awk '{print substr($2, 2, length($2)-3) }')
    if [[ "${RELEASE}" != "$(cat /opt/${APP}_version.txt)" ]] || [[ ! -f "/opt/${APP}_version.txt" ]]; then
        
        msg_info "Updating System"
        apt-get update &>/dev/null
        apt-get -y upgrade &>/dev/null
        msg_ok "Updated System"

       
        msg_info "Updating ${APP} to v${RELEASE}"
        

        echo "${RELEASE}" >/opt/${APP}_version.txt
        msg_ok "Updated ${APP} to v${RELEASE}"

        
        msg_info "Cleaning Up"
        rm "${RELEASE}.zip"
        $STD apt-get -y autoremove
        $STD apt-get -y autoclean
        msg_ok "Cleanup Completed"
    else
        msg_ok "No update required. ${APP} is already at v${RELEASE}"
    fi
    exit
}

start
build_container
description

msg_ok "Completed Successfully!\n"
echo -e "${CREATING}${GN}${APP} setup has been successfully initialized!${CL}"
echo -e "${INFO}${YW} Access it using the following URL:${CL}"
echo -e "${TAB}${GATEWAY}${BGN}http://${IP}:9000${CL}"
