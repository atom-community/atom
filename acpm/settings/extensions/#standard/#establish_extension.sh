#!/usr/bin/env bash

# create extension-linker as a helper
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

# default to allowing unfree
export NIXPKGS_ALLOW_UNFREE=1

# 
# connect during_purge
# 
mkdir -p "$FORNIX_FOLDER/settings/.cache/"
mkdir -p "$FORNIX_FOLDER/settings/during_purge/"
mkdir -p "$FORNIX_FOLDER/settings/during_clean/"

# 
# connect during_start/during_manual_start
# 
link_extension_file__to__ "commands/tools/fornix/ensure_all_commands_executable" "during_start/081_000__ensure_all_commands_executable__.sh"
link_extension_file__to__ "commands/tools/fornix/ensure_all_commands_executable" "during_manual_start/081_000__ensure_all_commands_executable__.sh"

# 
# connect commands
# 
# ensure commands folder exists
if ! [[ -d "$FORNIX_COMMANDS_FOLDER" ]]; then
    # remove a potenial file
    rm -f "$FORNIX_COMMANDS_FOLDER"
    # make the folder
    mkdir -p "$FORNIX_COMMANDS_FOLDER"
fi
link_extension_file__to__ "commands/tools/fornix"    "$FORNIX_COMMANDS_FOLDER/tools/fornix"
link_extension_file__to__ "commands/tools/string"      "$FORNIX_COMMANDS_FOLDER/tools/string"
link_extension_file__to__ "commands/tools/file_system" "$FORNIX_COMMANDS_FOLDER/tools/file_system"

# 
# flush broken symlinks (for when extensions are changed/removed)
# 
for_each_item_in="$FORNIX_COMMANDS_FOLDER"; [ -z "$__NESTED_WHILE_COUNTER" ] && __NESTED_WHILE_COUNTER=0;__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER + 1))"; trap 'rm -rf "$__temp_var__temp_folder"' EXIT; __temp_var__temp_folder="$(mktemp -d)"; mkfifo "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER"; (find "$for_each_item_in" -xtype l -print0 2>/dev/null | sort -z > "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER" &); while read -d $'\0' each
do
    rm -f "$each" 2>/dev/null
done < "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER";__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER - 1))"

for_each_item_in="$FORNIX_FOLDER/during_start"; [ -z "$__NESTED_WHILE_COUNTER" ] && __NESTED_WHILE_COUNTER=0;__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER + 1))"; trap 'rm -rf "$__temp_var__temp_folder"' EXIT; __temp_var__temp_folder="$(mktemp -d)"; mkfifo "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER"; (find "$for_each_item_in" -xtype l -print0 2>/dev/null | sort -z > "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER" &); while read -d $'\0' each
do
    rm -f "$each" 2>/dev/null
done < "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER";__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER - 1))"

for_each_item_in="$FORNIX_FOLDER/during_start_prep"; [ -z "$__NESTED_WHILE_COUNTER" ] && __NESTED_WHILE_COUNTER=0;__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER + 1))"; trap 'rm -rf "$__temp_var__temp_folder"' EXIT; __temp_var__temp_folder="$(mktemp -d)"; mkfifo "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER"; (find "$for_each_item_in" -xtype l -print0 2>/dev/null | sort -z > "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER" &); while read -d $'\0' each
do
    rm -f "$each" 2>/dev/null
done < "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER";__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER - 1))"

for_each_item_in="$FORNIX_FOLDER/during_manual_start"; [ -z "$__NESTED_WHILE_COUNTER" ] && __NESTED_WHILE_COUNTER=0;__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER + 1))"; trap 'rm -rf "$__temp_var__temp_folder"' EXIT; __temp_var__temp_folder="$(mktemp -d)"; mkfifo "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER"; (find "$for_each_item_in" -xtype l -print0 2>/dev/null | sort -z > "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER" &); while read -d $'\0' each
do
    rm -f "$each" 2>/dev/null
done < "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER";__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER - 1))"

for_each_item_in="$FORNIX_FOLDER/during_clean"; [ -z "$__NESTED_WHILE_COUNTER" ] && __NESTED_WHILE_COUNTER=0;__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER + 1))"; trap 'rm -rf "$__temp_var__temp_folder"' EXIT; __temp_var__temp_folder="$(mktemp -d)"; mkfifo "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER"; (find "$for_each_item_in" -xtype l -print0 2>/dev/null | sort -z > "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER" &); while read -d $'\0' each
do
    rm -f "$each" 2>/dev/null
done < "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER";__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER - 1))"

for_each_item_in="$FORNIX_FOLDER/during_purge"; [ -z "$__NESTED_WHILE_COUNTER" ] && __NESTED_WHILE_COUNTER=0;__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER + 1))"; trap 'rm -rf "$__temp_var__temp_folder"' EXIT; __temp_var__temp_folder="$(mktemp -d)"; mkfifo "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER"; (find "$for_each_item_in" -xtype l -print0 2>/dev/null | sort -z > "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER" &); while read -d $'\0' each
do
    rm -f "$each" 2>/dev/null
done < "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER";__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER - 1))"

for_each_item_in="$FORNIX_FOLDER/requirements"; [ -z "$__NESTED_WHILE_COUNTER" ] && __NESTED_WHILE_COUNTER=0;__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER + 1))"; trap 'rm -rf "$__temp_var__temp_folder"' EXIT; __temp_var__temp_folder="$(mktemp -d)"; mkfifo "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER"; (find "$for_each_item_in" -xtype l -print0 2>/dev/null | sort -z > "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER" &); while read -d $'\0' each
do
    rm -f "$each" 2>/dev/null
done < "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER";__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER - 1))"



