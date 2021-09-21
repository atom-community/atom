#!/usr/bin/env bash

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
# connect during_start
# 
link_extension_file__to__ "commands/setup_venv" "during_start/019_000_setup_python_venv.sh"
link_extension_file__to__ "commands/add_project_to_pythonpath" "during_start/022_000_setup_pythonpath.sh"
link_extension_file__to__ "commands/ensure_pip_modules" "during_start/021_000_ensure_pip_modules.sh"
link_extension_file__to__ "commands/refresh_ignores" "during_start/024_000_python_ignores.sh"


# 
# connect during_manual_start
# 
link_extension_file__to__ "commands/add_project_to_pythonpath" "during_manual_start/022_000_setup_pythonpath.sh"
link_extension_file__to__ "commands/refresh_ignores" "during_manual_start/024_000_python_ignores.sh"

# 
# connect during_clean
# 
link_extension_file__to__ "during_clean.sh" "during_clean/801_python.sh"

# 
# connect during_purge
# 
link_extension_file__to__ "during_purge.sh" "during_purge/802_remove_venv.sh"

# 
# connect commands
# 
link_extension_file__to__ "commands" "$FORNIX_COMMANDS_FOLDER/tools/python"