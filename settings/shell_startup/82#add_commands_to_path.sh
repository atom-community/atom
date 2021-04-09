# add commands to path
PATH="$PWD/settings/commands:$PATH"

# if theres a help command
if [[ -f "./settings/commands/help" ]]; then
    # override the default bash "help"
    alias help="./settings/commands/help" 
fi