import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScriptSchema, type Script } from "../_schemas/schemas";
import { Button } from "@/components/ui/button";

const initialScript: Script = {
  name: "",
  slug: "",
  categories: [],
  date_created: "",
  type: "ct",
  updateable: false,
  privileged: false,
  interface_port: null,
  documentation: null,
  website: null,
  logo: null,
  description: "",
  install_methods: [],
  default_credentials: {
    username: null,
    password: null,
  },
  notes: [],
};


const App: React.FC<{ script: Script }> = ({ script }) => {
  return (
    <div className="relative">
        <h3 className="text-2xl font-bold mb-4">Generated {script.slug.toLowerCase()}.sh file</h3>
          <pre className="mt-4 p-4 bg-secondary rounded shadow overflow-x-scroll">
          <div>{`  
          #!/usr/bin/env bash
          source <(curl -s https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/misc/build.func)
          # Copyright (c) 2021-2024 community-scripts ORG
          # Author: [YourUserName]
          # License: MIT | https://github.com/community-scripts/ProxmoxVE/raw/main/LICENSE
          # Source: ${script.website}

         
          APP="[APP_NAME]"         
          TAGS="[TAGS]"         
          var_cpu="[CPU]"          
          var_ram="[RAM]"         
          var_disk="[DISK]"          
          var_os="[OS]"         
          var_version="[VERSION]"          
          var_unprivileged="[UNPRIVILEGED]"         
          header_info "$APP"
          base_settings
          
          variables
          color
          catch_errors

          function update_script() {
              header_info
              check_container_storage
              check_container_resources
          
              # Check if installation is present | -f for file, -d for folder
              if [[ ! -f [INSTALLATION_CHECK_PATH] ]]; then
                  msg_error "No \${App} Installation Found!"
                  exit
              fi
          
              # Crawling the new version and checking whether an update is required
              RELEASE=$(curl -fsSL [RELEASE_URL] | [PARSE_RELEASE_COMMAND])
              if [[ "\${RELEASE}" != "$(cat /opt/\${APP}_version.txt)" ]] || [[ ! -f /opt/\${APP}_version.txt ]]; then
                  msg_info "Updating $APP"
          
              # Stopping Services
              msg_info "Stopping $APP"
              systemctl stop [SERVICE_NAME]
              msg_ok "Stopped $APP"

              # Creating Backup
              msg_info "Creating Backup"
              tar -czf "/opt/\${APP}_backup_$(date +%F).tar.gz" [IMPORTANT_PATHS]
              msg_ok "Backup Created"

              # Execute Update
              msg_info "Updating \$APP to v\${RELEASE}"
              [UPDATE_COMMANDS]
              msg_ok "Updated \$APP to v\${RELEASE}"

              # Starting Services
              msg_info "Starting \$APP"
              systemctl start [SERVICE_NAME]
              sleep 2
              msg_ok "Started \$APP"

              # Cleaning up
              msg_info "Cleaning Up"
              rm -rf [TEMP_FILES]
              msg_ok "Cleanup Completed"

              # Last Action
              echo "\${RELEASE}" >/opt/\${APP}_version.txt
              msg_ok "Update Successful"
              else
                  msg_ok "No update required. \${APP} is already at v\${RELEASE}"
              fi
              exit
            }

            start
            build_container
            description

            msg_ok "Completed Successfully!\n"
            echo -e "\${CREATING}\${GN}\${APP} setup has been successfully initialized!\${CL}"
            echo -e "\${INFO}\${YW} Access it using the following URL:\${CL}"
            echo -e "\${TAB}\${GATEWAY}\${BGN}http://\${IP}:[PORT]\${CL}"
          `}
          </div>
          </pre>
        </div>


  );
};

export default App;
