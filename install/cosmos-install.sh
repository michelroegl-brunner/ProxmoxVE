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
 wget \
 avahi-daemon \
 uuid-runtime \
 fdisk
msg_ok "Installed Dependencies"

msg_info "Install mergerfs"
MERGERFS_VERSION="2.40.2"
wget -q "https://github.com/trapexit/mergerfs/releases/download/${MERGERFS_VERSION}/mergerfs_${MERGERFS_VERSION}.debian-bullseye_amd64.deb"
$STD dpkg -i "mergerfs_${MERGERFS_VERSION}.debian-bullseye_amd64.deb" || $STD apt-get install -f -y
rm "mergerfs_${MERGERFS_VERSION}.debian-bullseye_amd64.deb"
msg_ok "Installed mergerfs"

msg_info "Install Mongo DB"
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" > /etc/apt/sources.list.d/mongodb-org-8.0.list
$STD apt-get update
$STD apt-get install -y mongodb-org
systemctl enable -q --now mongod
msg_ok  "Installed Mongo DB"

msg_info "Install Docker"
curl -fsSL https://get.docker.com -o get-docker.sh
$STD sh get-docker.sh
rm get-docker.sh
msg_ok "Installed Docker"

msg_info "Configure MongoDB"
MONGO_ADMIN_USER="admin"
MONGO_ADMIN_PWD="$(openssl rand -base64 18 | cut -c1-13)"
COSMOS_USER="cosmos"
COSMOS_PWD="$(openssl rand -base64 18 | cut -c1-13)"
MONGO_CONNECTION_STRING="mongodb://${COSMOS_USER}:${COSMOS_PWD}@localhost:27017/cosmos"
COSMOS_SECRET=$(uuidgen)
{
  echo "Cosmos-Credentials"
  echo "Mongo Database Admin User: $MONGO_ADMIN_USER"
  echo "Mongo Database Admin Password: $MONGO_ADMIN_PWD"
  echo "Cosmos User: $COSMOS_USER"
	echo "Cosmos Password: $COSMOS_PWD"
	echo "Cosmos Secret: $COSMOS_SECRET"
  echo "Mongo Connection String: $MONGO_CONNECTION_STRING"
} >> ~/nodebb.creds

$STD mongosh <<EOF
use admin
db.createUser({
  user: "$MONGO_ADMIN_USER",
  pwd: "$MONGO_ADMIN_PWD",
  roles: [{ role: "root", db: "admin" }]
})

use cosmos
db.createUser({
  user: "$COSMOS_USER",
  pwd: "$COSMOS_PWD",
  roles: [
    { role: "readWrite", db: "cosmos" },
    { role: "clusterMonitor", db: "admin" }
  ]
})
quit()
EOF
sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf
sed -i '/security:/d' /etc/mongod.conf
bash -c 'echo -e "\nsecurity:\n  authorization: enabled" >> /etc/mongod.conf'
systemctl restart mongod
msg_ok "MongoDB successfully configurated" 

msg_info "Install Cosmos" 
mkdir -p /opt/cosmos
LATEST_RELEASE=$(curl -s https://api.github.com/repos/azukaar/Cosmos-Server/releases/latest | grep "tag_name" | cut -d '"' -f 4)
ZIP_FILE="cosmos-cloud-${LATEST_RELEASE#v}-amd64.zip"
curl -sL "https://github.com/azukaar/Cosmos-Server/releases/download/${LATEST_RELEASE}/${ZIP_FILE}" -o "/opt/cosmos/${ZIP_FILE}"
cd /opt/cosmos
unzip -o -q "${ZIP_FILE}"
LATEST_RELEASE_NO_V=${LATEST_RELEASE#v}
mv /opt/cosmos/cosmos-cloud-${LATEST_RELEASE_NO_V}/* /opt/cosmos/
rmdir /opt/cosmos/cosmos-cloud-${LATEST_RELEASE_NO_V}
chmod +x /opt/cosmos/cosmos
msg_ok "Installed Cosmos"

msg_info "Creating Cosmos Service"
sed -i "s|\"MongoDB\": *\"[^\"]*\"|\"MongoDB\": \"$MONGO_CONNECTION_STRING\"|" /var/lib/cosmos/cosmos.config.json
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

systemctl enable -q --now cosmos.service
msg_info "Created Service"

motd_ssh
customize

msg_info "Cleaning up"

rm -f "/opt/cosmos/cosmos-cloud-${COSMOS_RELEASE#v}-amd64.zip"
$STD apt-get -y autoremove
$STD apt-get -y autoclean
msg_ok "Cleaned"
