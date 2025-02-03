#!/usr/bin/env bash

# Copyright (c) 2021-2025 tteck
# Author: tteck (tteckster)
# License: MIT
# https://github.com/community-scripts/ProxmoxVE/raw/main/LICENSE
set -x
source /dev/stdin <<< "$FUNCTIONS_FILE_PATH"
source /dev/stdin <<< $(wget -qLO - https://raw.githubusercontent.com/michelroegl-brunner/ProxmoxVE/refs/heads/develop/misc/api.func)
#source /dev/stdin <<< "$API_FILE_PATH"
color
verb_ip6
catch_errors
setting_up_container


msg_info "Installing Dependencies"
$STD apt-get install -y curl
post_update_to_api "done" "none"
$STD apt-get install -y sudo
$STD apt-get insta -y mc
msg_ok "Installed Dependencies"

motd_ssh
customize

msg_info "Cleaning up"
$STD apt-get -y autoremove
$STD apt-get -y autoclean
msg_ok "Cleaned"
