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
$STD dpkg -i "mergerfs_${MERGERFS_VERSION}.debian-bullseye_amd64.deb" || apt-get install -f -y

msg_ok "Installed mergerfs"

msg_info "Install Mongo DB"
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
$STD apt-get update
$STD apt-get install -y mongodb-org
msg_ok  "Installed Mongo DB"

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
COSMOS_RELEASE=$(curl -s https://api.github.com/repos/azukaar/Cosmos-Server/releases/latest | grep "tag_name" | cut -d '"' -f 4)
curl -L "https://github.com/azukaar/Cosmos-Server/releases/download/${LATEST_RELEASE}/${ZIP_FILE}" -o "/opt/cosmos/cosmos-cloud-${COSMOS_RELEASE#v}-amd64.zip"
cd /opt/cosmos
unzip -o "cosmos-cloud-${COSMOS_RELEASE#v}-amd64.zip"
mv /opt/cosmos/cosmos-cloud-${COSMOS_RELEASE#v}/* /opt/cosmos/
chmod +x /opt/cosmos/cosmos

msg_ok "Installed Cosmos"

msg_info "Creating Cosmos Service"
eval "/opt/cosmos/cosmos service install"
systemctl daemon-reload
systemctl start CosmosCloud

msg_info "Created Service"


motd_ssh
customize

msg_info "Cleaning up"
rm "mergerfs_${MERGERFS_VERSION}.debian-bullseye_amd64.deb"
rm -f "/opt/cosmos/cosmos-cloud-${COSMOS_RELEASE#v}-amd64.zip"
$STD apt-get -y autoremove
$STD apt-get -y autoclean
msg_ok "Cleaned"
