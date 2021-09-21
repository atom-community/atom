# add commands to path
PATH="$FORNIX_COMMANDS_FOLDER:$PATH"

# if theres a help command
if [[ -f "$FORNIX_COMMANDS_FOLDER/help" ]]; then
    # override the default bash "help"
    alias help="$FORNIX_COMMANDS_FOLDER/help" 
fi