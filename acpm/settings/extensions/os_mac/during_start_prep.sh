# keychain is mac-os specific, just FYI
__temp_var_path_to_keychain="$HOME/Library/Keychains/"
if [[ -d "$__temp_var_path_to_keychain" ]]; then
    mkdir -p "$FORNIX_HOME/Library/"
    # link all the keys
    ln -sf "$__temp_var_path_to_keychain" "$FORNIX_HOME/Library/"
fi

# Make sure the user doesn't accidentally commit their keys/passwords!!
"$FORNIX_FOLDER/settings/extensions/git/commands/ignore" "$FORNIX_HOME/Library/Keychains"