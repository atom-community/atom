if [ -d "$FORNIX_FOLDER" ]
then
    # delete venv
    "$FORNIX_FOLDER/settings/extensions/#standard/commands/tools/file_system/remove" "$FORNIX_FOLDER/.venv"
    
    # if poetry exists
    if [ -n "$(command -v "poetry")" ]
    then
        # clear all the caches
        yes | poetry cache clear . --all
    fi
fi