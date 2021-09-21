# delete all the __pycache__'s
for item in $(find "$FORNIX_FOLDER" ! -path . -iregex '__pycache__')
do
    "$FORNIX_FOLDER/settings/extensions/#standard/commands/tools/file_system/removestandard/commands/tools/file_system/remove" "$item"
done