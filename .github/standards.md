# Coding Standards for Proxmox VE Helper-Scripts

**Welcome to the Coding Standards Guide!** 
📜 This document outlines the essential coding standards for all our scripts and JSON files. Adhering to these standards ensures that our codebase remains consistent, readable, and maintainable. By following these guidelines, we can improve collaboration, reduce errors, and enhance the overall quality of our project.

### Why Coding Standards Matter

Coding standards are crucial for several reasons:

1. **Consistency**: Consistent code is easier to read, understand, and maintain. It helps new team members quickly get up to speed and reduces the learning curve.
2. **Readability**: Clear and well-structured code is easier to debug and extend. It allows developers to quickly identify and fix issues.
3. **Maintainability**: Code that follows a standard structure is easier to refactor and update. It ensures that changes can be made with minimal risk of introducing new bugs.
4. **Collaboration**: When everyone follows the same standards, it becomes easier to collaborate on code. It reduces friction and misunderstandings during code reviews and merges.

### Scope of This Document

This document covers the coding standards for the following types of files in our project:

- **`*-install.sh` Scripts**: These scripts are responsible for the installation of applications and are located in the `/install` directory.
- **`*-ct.sh` Scripts**: These scripts handle the creation and updating of containers and are found in the `/ct` directory.
- **JSON Files**: These files store structured data and are located in the `/json` directory.

Each section provides detailed guidelines on various aspects of coding, including shebang usage, comments, variable naming, function naming, indentation, error handling, command substitution, quoting, script structure, and logging. Additionally, examples are provided to illustrate the application of these standards.

By following the coding standards outlined in this document, we ensure that our scripts and JSON files are of high quality, making our project more robust and easier to manage. Please refer to this guide whenever you create or update scripts and JSON files to maintain a high standard of code quality across the project. 📚🔍

Let's work together to keep our codebase clean, efficient, and maintainable! 💪🚀

---

# ***-install.sh Scripts**
 `*-install.sh` scripts found in the `/install` directory. These scripts are responsible for the installation of the desired Application. For this guide we take `/install/snipeit-install.sh` as example.

## 1. **File Header**

### 1.1 **Shebang**
- Use `#!/usr/bin/env bash` as the shebang for portability across systems.

```bash
#!/usr/bin/env bash
```

### 1.2 **Comments**
- Add clear comments for script metadata, including author, copyright, and license information.
- Use meaningful inline comments to explain complex commands or logic.

Example:
```bash
# Copyright (c) 2021-2024 community-scripts ORG
# Author: [YourUserName]
# License: MIT
# Source: [SOURCE_URL]
```
### 1.3 **Variables and Function import**
- This sections adds the support for all needed functions and variables.
```bash
source /dev/stdin <<<"$FUNCTIONS_FILE_PATH"
color
verb_ip6
catch_errors
setting_up_container
network_check
update_os
```
---

## 2. **Variable Naming and Management**

### 2.1 **Naming Conventions**
- Use uppercase names for constants and environment variables.
- Use lowercase names for local script variables.

Example:
```bash
DB_NAME=snipeit_db    # Environment-like variable (constant)
DB_USER="snipeit"     # Local variable
```

### 2.2 **Avoid Hardcoding Values**
- Dynamically generate sensitive values, like passwords, using tools like `openssl` or `awk`.

Example:
```bash
DB_PASS=$(openssl rand -base64 18 | tr -dc 'a-zA-Z0-9' | head -c13)
```

---

## 3. **Dependencies**

### 3.1 **Install all at once**
- Install all dependencies with a single command if possible

Example:
```bash
$STD apt-get install -y \
  curl \
  composer \
  git \
  sudo \
  mc \
  nginx 
```

### 3.2 **Collaps Dependencies**
- Collaps dependencies to keep the Code readable.

Example: <br>
Use
```bash
php8.2-{bcmath,common,ctype}
```
instead of
```bash
php8.2-bcmath php8.2-common php8.2-ctype
```
---

## 4. **Input and Output Management**

### 4.1 **User Feedback**
- Use standard functions like `msg_info` and `msg_ok` to print status messages.
- Display meaningful progress messages at key stages.

Example:
```bash
msg_info "Installing Dependencies"
$STD apt-get install ...
msg_ok "Installed Dependencies"
```
### 5.2 **Verbosity**
- Use the appropiate flag (**-q** in the examples) for a command to suppres its output
Example:
```bash
wget -q
unzip -q
```
- If a command dose not come with such a functionality use `$STD` (a custom standard redirection variable) for managing output verbosity.

Example:
```bash
$STD apt-get install -y nginx
```
---

## 6. **String Manipulation**

### 6.1 **Environment File Configuration**
- Use `sed` to replace placeholder values in configuration files.

Example:
```bash
sed -i -e "s|^DB_DATABASE=.*|DB_DATABASE=$DB_NAME|" \
       -e "s|^DB_USERNAME=.*|DB_USERNAME=$DB_USER|" \
       -e "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASS|" .env
```

---

## 7. **Security Practices**

### 7.1 **Password Generation**
- Use secure tools (e.g., `openssl`) to generate random passwords.

Example:
```bash
DB_PASS=$(openssl rand -base64 18 | tr -dc 'a-zA-Z0-9' | head -c13)
```

### 7.2 **File Permissions**
- Explicitly set secure ownership and permissions for sensitive files.

Example:
```bash
chown -R www-data: /opt/snipe-it
chmod -R 755 /opt/snipe-it
```

---

## 8. **Service Configuration**

### 8.1 **Configuration Files**
- Use `cat <<EOF` to write configuration files in a clean and readable way.

Example:
```bash
cat <<EOF >/etc/nginx/conf.d/snipeit.conf
server {
    listen 80;
    root /opt/snipe-it/public;
    index index.php;
}
EOF
```
### 8.2 **Credential Management**
- Store the generated credentials in a file
Example:
```bash
USERNAME=username
PASSWORD=$(openssl rand -base64 18 | tr -dc 'a-zA-Z0-9' | head -c13)
{
    echo "Application-Credentials"
    echo "Username: $USERNAME"
    echo "Password: $PASSWORD"
} >> ~/application.creds
```
### 8.3 **Enviromental Files**
- Use `cat <<EOF` to write enviromental files in a clean and readable way.
```bash
cat <<EOF >/path/to/.env
VARIABLE="value"
PORT=3000
DB_NAME="${DB_NAME}"
EOF
```

### 8.4 **Reload Services**
- Enable affected services after configuration changes and start it right away.

Example:
```bash
systemctl enable -q --now nginx
```

---

## 9. **Cleanup**

### 9.1 **Remove Temporary Files**
- Remove temporary files or unnecessary downloads after use.

Example:
```bash
rm -rf /opt/v${RELEASE}.zip
```

### 9.2 **Autoremove and Autoclean**
- Clean up unused dependencies to reduce disk space usage.

Example:
```bash
apt-get -y autoremove
apt-get -y autoclean
```

---

## 10. **Consistency and Style**

### 10.1 **Indentation**
- Use 2 spaces for indentation for better readability.


---

## 11. **Best Practices Checklist**

- [ ] Shebang is correctly set (`#!/usr/bin/env bash`).
- [ ] Metadata (author, license) is included at the top.
- [ ] Variables follow naming conventions.
- [ ] Sensitive values are dynamically generated.
- [ ] Files and services have proper permissions.
- [ ] Script cleans up temporary files.

---

### Example: High-Level Script Flow

1. **Dependencies Installation**
2. **Database Setup**
3. **Download and Configure Application**
4. **Service Configuration**
5. **Final Cleanup**

--- 

By adhering to these coding standards, shell scripts will be more robust, secure, and maintainable.