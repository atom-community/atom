# if FORNIX_FOLDER is not set, then assume the current folder
if [[ -z "$FORNIX_FOLDER" ]]
then
    "$FORNIX_COMMANDS_FOLDER/tools/python/check_pip_modules"
fi