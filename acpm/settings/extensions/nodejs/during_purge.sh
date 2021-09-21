if [ -d "$FORNIX_FOLDER" ]
then
    # delete node_modules
    "$FORNIX_FOLDER/settings/extensions/#standard/commands/tools/file_system/remove" "$FORNIX_FOLDER/node_modules"
    # .npm 
    "$FORNIX_FOLDER/settings/extensions/#standard/commands/tools/file_system/remove" "$FORNIX_HOME/.npm"
    # npmrc
    "$FORNIX_FOLDER/settings/extensions/#standard/commands/tools/file_system/remove" "$FORNIX_HOME/.npmrc"
fi