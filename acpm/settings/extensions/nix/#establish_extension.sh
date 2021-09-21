export __FORNIX_NIX_SETTINGS_PATH="$FORNIX_FOLDER/settings/extensions/nix/settings.toml"
export __FORNIX_NIX_MAIN_CODE_PATH="$FORNIX_FOLDER/settings/extensions/nix/parse_dependencies.nix"
export __FORNIX_NIX_PACKAGES_FILE_PATH="$FORNIX_FOLDER/settings/requirements/nix.toml"
export __FORNIX_NIX_PATH_EXPORT_FILE="$FORNIX_FOLDER/settings/.cache/dependency_paths.do_not_sync.json"
export __FORNIX_NIX_COMMANDS="$FORNIX_FOLDER/settings/extensions/nix/commands"

# 
# this is just a helper (common to most all extensions)
# 
link_extension_file__to__() {
    local_file="$1"
    target_file="$2"
    
    # check for absolute path, if not absolute make it relative to project/settings
    case "$target_file" in
        /*) __temp_var__is_absolute_path="true" ;;
        *) : ;;
    esac
    if ! [ "$__temp_var__is_absolute_path" = "true" ]
    then
        __temp_var__target_full_path="$FORNIX_FOLDER/settings/$target_file"
    else
        __temp_var__target_full_path="$target_file"
    fi
    unset __temp_var__is_absolute_path
    
    # remove existing things in the way
    rm -f "$__temp_var__target_full_path" 2>/dev/null
    rm -rf "$__temp_var__target_full_path" 2>/dev/null
    # make sure parent folder exists
    mkdir -p "$(dirname "$__temp_var__target_full_path")"
    # link the file (relative link, which it what makes it complicated)
    __temp_var__path_from_target_to_local_file="$(realpath "$__THIS_FORNIX_EXTENSION_FOLDERPATH__" --relative-to="$(dirname "$__temp_var__target_full_path")" --canonicalize-missing)/$local_file"
    ln -s "$__temp_var__path_from_target_to_local_file" "$__temp_var__target_full_path"
    unset __temp_var__path_from_target_to_local_file
    
    unset local_file
    unset target_file
}

# 
# connect shell.nix
# 
link_extension_file__to__ "shell.nix" "requirements/shell.nix"

# 
# connect nix.toml
# 
link_extension_file__to__ "nix.toml" "requirements/nix.toml"

# 
# connect commands
# 
link_extension_file__to__ "commands" "$FORNIX_COMMANDS_FOLDER/tools/nix"

# 
# connect during_clean
# 
link_extension_file__to__ "during_clean.sh" "during_clean/450_nix.sh"

# 
# connect during_start
# 
link_extension_file__to__ "during_start.sh" "during_start/010_000__ssl_fix__.sh"