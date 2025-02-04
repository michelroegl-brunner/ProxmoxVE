#!/usr/bin/env bash


#Copyright (c) 2021-2025 community-scripts ORG
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
 curl \
 mc \
 sudo \
 gnupg \
 ca-certificates \
 openssl \
 snapraid \
 fdisk
msg_ok "Installed Dependencies"

msg_info "Install mergerfs"

MERGERFS_VERSION="2.40.2"
wget -q "https://github.com/trapexit/mergerfs/releases/download/${MERGERFS_VERSION}/mergerfs_${MERGERFS_VERSION}.debian-bullseye_amd64.deb"
$STD dpkg -i "mergerfs_${MERGERFS_VERSION}.debian-bullseye_amd64.deb" || $STD apt-get install -f -y

msg_ok "Installed mergerfs"

msg_info "Install Mongo DB"
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
$STD apt-get update
$STD apt-get install -y mongodb-org
msg_ok  "Installed Mongo DB"

msg_info "Install Docker"

curl -fsSL https://get.docker.com -o get-docker.sh
$STD sh get-docker.sh
rm get-docker.sh

msg_ok "Installed Docker"

msg_info "Setting up database"
DB_NAME=cosmos_db
DB_USER=cosmos
DB_PASS=$(openssl rand -base64 18 | tr -dc 'a-zA-Z0-9' | head -c13)
{
    echo "Cosmos-DB--Credentials"
    echo "Cosmos Database User: $DB_USER"
    echo "Cosmos Database Password: $DB_PASS"
    echo "Cosmos Database Name: $DB_NAME"
} >> ~/cosmos_db.creds
msg_ok "Set up database"

msg_info "Install Cosmos" 
mkdir -p /opt/cosmos
LATEST_RELEASE=$(curl -s https://api.github.com/repos/azukaar/Cosmos-Server/releases/latest | grep "tag_name" | cut -d '"' -f 4)
ZIP_FILE="cosmos-cloud-${LATEST_RELEASE#v}-amd64.zip"

curl -sL "https://github.com/azukaar/Cosmos-Server/releases/download/${LATEST_RELEASE}/${ZIP_FILE}" -o "/opt/cosmos/${ZIP_FILE}"
cd /opt/cosmos
unzip -o "${ZIP_FILE}"
LATEST_RELEASE_NO_V=${LATEST_RELEASE#v}

mv /opt/cosmos/cosmos-cloud-${LATEST_RELEASE_NO_V}/* /opt/cosmos/
rmdir /opt/cosmos/cosmos-cloud-${LATEST_RELEASE_NO_V}
chmod +x /opt/cosmos/cosmos

msg_ok "Installed Cosmos"

msg_info "Creating Cosmos Service"
cat <<EOF > /etc/systemd/system/cosmos.service
[Unit]
Description=Cosmos Cloud service
ConditionFileIsExecutable=/opt/cosmos/start.sh

[Service]
StartLimitInterval=10
StartLimitBurst=5
ExecStart=/opt/cosmos/start.sh

WorkingDirectory=/opt/cosmos

Restart=always

RestartSec=2
EnvironmentFile=-/etc/sysconfig/CosmosCloud

[Install]
WantedBy=multi-user.target
EOF

msg_info "Created Service"

mongodb://cosmos:vxd0BadXBA526@localhost:27017/cosmos_db
motd_ssh
customize

msg_info "Cleaning up"
rm "mergerfs_${MERGERFS_VERSION}.debian-bullseye_amd64.deb"
rm -f "/opt/cosmos/cosmos-cloud-${COSMOS_RELEASE#v}-amd64.zip"
$STD apt-get -y autoremove
$STD apt-get -y autoclean
msg_ok "Cleaned"
