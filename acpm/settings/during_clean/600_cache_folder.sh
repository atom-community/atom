# the usual things
__temp_var_cache_folder="$FORNIX_FOLDER/settings/.cache"
"$FORNIX_FOLDER/settings/extensions/#standard/commands/tools/file_system/remove" "$__temp_var_cache_folder"
for item in $(find "$FORNIX_FOLDER" ! -path . -iregex '.*\.cleanable(\..*)?')
do
    "$FORNIX_FOLDER/settings/extensions/#standard/commands/tools/file_system/remove" "$item"
done
# restore the keep file
mkdir -p "$__temp_var_cache_folder" && touch "$__temp_var_cache_folder/.keep"