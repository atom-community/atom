# check if file exists
if [ -f "$FORNIX_COMMANDS_FOLDER/project/commands" ]
then
    echo ""
    echo ""
    "$FORNIX_COMMANDS_FOLDER/project/commands"
fi