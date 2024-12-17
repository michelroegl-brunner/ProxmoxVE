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
 `*-install.sh` scripts found in the `/install` directory. These scripts are responsible for the installation of the desired Application.


## 1. Shebang
All scripts start with the following shebang to specify the script should be run with `bash`:
```sh
#!/bin/bash
```

## 2. Header
The header of the file should contain the following lines:
```
# Copyright (c) 2021-2024 community-scripts ORG
# Author: [YourUserName]
# License: MIT | https://github.com/community-scripts/ProxmoxVE/raw/main/LICENSE
```

## 2. Comments
- Use `#` for single-line comments.
- Provide comments for complex logic and important sections of the script.

## 3. Variable Naming
- Use uppercase for global variables (e.g., `RELEASE`).

## 4. Indentation
- Use 2 spaces for indentation.
- Use the Shell Format Tool in VS Code if possible. (Format Document befor submitting a Pull request)

## 5. Command Substitution
- Use `$(...)` for command substitution instead of backticks.

## 6. Dependencies
- Install all Dependencies in one section if possible.
- All Dependencies should be installed with a single `apt-get install` command: 
  ```
  $STD apt-get install -y \
  curl \
  composer \
  git \
  sudo \
  mc \
  nginx 
  ```
- You should collaps the list if possible to maintain redabillity. `php8.2-{bcmath,common,ctype}` instead of `php8.2-bcmath php8.2-common php8.2-ctype`

## 7. Quite/Silent mode
- Where ever possible, use the appropiate flag to silence the output of a command ie. the **-q** in `wget -q` or `unzip -q`
- If ther is no such option, use the **$STD** variable at the beginning of a command to suppress the output when not in verbose mode.


## 9. Script Structure
- Organize the script into sections: Start each section with `message_info "Section Name"` and end it with `message_ok "Section Name"`
- Do not overdo it. Not everey action dose need it´s own section.

## 10. Logging
- Use `echo` for logging messages.
- Provide informative messages for the start and end of major operations.

## Example
```sh
#!/bin/bash

# Constants
INSTALL_DIR="/usr/local/bin"

# Functions
install_package() {
    local package_name="$1"
    echo "Installing $package_name..."
    # Installation logic here
    echo "$package_name installed successfully."
}

# Main Execution
set -e

echo "Starting installation process..."
install_package "example-package"
echo "Installation process completed."
```

By following these coding standards, we ensure that our `*-install.sh` scripts are consistent, readable, and maintainable. 🧹✨

Please refer to this document when creating or updating `*-install.sh` scripts to maintain a high standard of code quality across the project. 📚🔍

---

# ***-ct.sh Scripts**

 `*-ct.sh` scripts are found in the `/ct` directory. This scripts are responsible to create the container as well as updating the install Applicatiions

## 1. Shebang
All scripts start with the following shebang to specify the script should be run with `bash`:
```sh
#!/bin/bash
```

## 2. Comments
- Use `#` for single-line comments.
- Provide comments for complex logic and important sections of the script.

## 3. Variable Naming
- Use uppercase for environment variables (e.g., `CT_DIR`).
- Use lowercase for local variables (e.g., `container_id`).

## 4. Function Naming
- Use `snake_case` for function names (e.g., `create_container`).

## 5. Indentation
- Use 4 spaces for indentation.
- Align continuation lines with the opening delimiter.

## 6. Error Handling
- Check the exit status of commands and handle errors appropriately.
- Use `set -e` to exit immediately if a command exits with a non-zero status.

## 7. Command Substitution
- Use `$(...)` for command substitution instead of backticks.

## 8. Quoting
- Quote variables to prevent word splitting and globbing (e.g., `"$variable"`).

## 9. Script Structure
- Organize the script into sections: variable declarations, functions, and main execution.
- Use functions to encapsulate reusable code.

## 10. Logging
- Use `echo` for logging messages.
- Provide informative messages for the start and end of major operations.

## Example
```sh
#!/bin/bash

# Constants
CT_DIR="/var/lib/lxc"

# Functions
create_container() {
    local container_id="$1"
    echo "Creating container $container_id..."
    # Creation logic here
    echo "Container $container_id created successfully."
}

# Main Execution
set -e

echo "Starting container creation process..."
create_container "example-container"
echo "Container creation process completed."
```

By following these coding standards, we ensure that our `*-ct.sh` scripts are consistent, readable, and maintainable. 🧹✨

Please refer to this document when creating or updating `*-ct.sh` scripts to maintain a high standard of code quality across the project. 📚🔍


---

# **JSON Files**

JSON files arefound in the `/json` directory. 🗂️ This files are responsible to bring all relevant information to the user with the help of the frontend.

## 1. Formatting
- Use 2 spaces for indentation.
- Ensure proper nesting and alignment of elements.

## 2. Naming Conventions
- Use `camelCase` for keys (e.g., `userName`).
- Use lowercase for values unless they are proper nouns or acronyms.

## 3. Data Types
- Use appropriate data types for values (e.g., strings, numbers, booleans, arrays, objects).
- Avoid using `null` unless absolutely necessary.

## 4. Comments
- JSON does not support comments. Use external documentation to explain complex structures.

## 5. Consistency
- Ensure consistent use of keys and structure across all JSON files.
- Maintain a consistent order of keys for readability.

## 6. Validation
- Validate JSON files to ensure they are well-formed and adhere to the expected schema.
- Use tools like `jsonlint` or online validators for this purpose.

## 7. Tools
- Use the JSON editor available at [ProxmoxVE JSON Editor](https://community-scripts.github.io/ProxmoxVE/json-editor) to create and edit JSON files instead of doing them by hand.

## Example
```json
{
    "assetTag": "12345",
    "assetName": "Laptop",
    "assignedTo": "johnDoe",
    "status": "inUse",
    "purchaseDate": "2023-01-15",
    "warranty": {
        "expiryDate": "2025-01-15",
        "provider": "TechCorp"
    }
}
```

By following these coding standards, we ensure that our JSON files are consistent, readable, and maintainable. 🧹✨

Please refer to this document when creating or updating JSON files to maintain a high standard of data quality across the project. 📚🔍

Remember, clean data is happy data! 😃💻 Let's work together to keep our JSON files in top shape. 💪🚀
