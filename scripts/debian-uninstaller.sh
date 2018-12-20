#!/bin/bash

# This script runs when user uninstall the debian package.
# It will remove all the config files and anything which was added by the app.

# Delete the link to the binary
echo 'Removing binary link'
sudo rm -f '/usr/local/bin/${executable}';