#!/usr/bin/env bash

# 
# ensure FORNIX_FOLDER exists
# 
if [ -z "$FORNIX_FOLDER" ]
then
    # 
    # find fornix_core
    # 
    path_to_file=""
    file_name="settings/fornix_core"
    folder_to_look_in="$PWD"
    while :
    do
        # check if file exists
        if [ -f "$folder_to_look_in/$file_name" ]
        then
            path_to_file="$folder_to_look_in/$file_name"
            break
        else
            if [ "$folder_to_look_in" = "/" ]
            then
                break
            else
                folder_to_look_in="$(dirname "$folder_to_look_in")"
            fi
        fi
    done
    if [ -z "$path_to_file" ]
    then
        #
        # what to do if file never found
        #
        echo "Im a script running with a pwd of:$PWD"
        echo "Im looking for settings/fornix_core in a parent folder"
        echo "Im exiting now because I wasnt able to find it"
        echo "thats all the information I have"
        exit
    fi
    export FORNIX_NEXT_RUN_ONLY_DO_BASIC_INIT="true"
    # run the basic init of fornix to get the FORNIX_FOLDER/FORNIX_COMMANDS_FOLDER/FORNIX_HOME etc
    . "$path_to_file"
fi

# 
# 
# actual program
# 
# 

# make sure commands are executable
chmod -R ugo+x "$FORNIX_COMMANDS_FOLDER" &>/dev/null || sudo chmod -R ugo+x "$FORNIX_COMMANDS_FOLDER" &>/dev/null

# 
# create aliases for all of the folders to allow recursive execution
# 
# yes its ugly, welcome to bash programming
# this loop is so stupidly complicated because of many inherent-to-shell reasons, for example: https://stackoverflow.com/questions/13726764/while-loop-subshell-dilemma-in-bash
for_each_item_in="$FORNIX_COMMANDS_FOLDER"
[ -z "$__NESTED_WHILE_COUNTER" ] && __NESTED_WHILE_COUNTER=0;__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER + 1))"; trap 'rm -rf "$__temp_var__temp_folder"' EXIT; __temp_var__temp_folder="$(mktemp -d)"; mkfifo "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER"; (find "$for_each_item_in" -maxdepth 1 ! -path . -print0 2>/dev/null | sort -z > "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER" &); while read -d $'\0' each
do
    # if its a folder
    if [[ -d "$each" ]]
    then
        name="$(basename "$each")"
        eval '
        '"$name"' () {
            # enable globbing
            setopt extended_glob &>/dev/null
            shopt -s globstar &>/dev/null
            shopt -s dotglob &>/dev/null
            local search_path='"'""$("$FORNIX_FOLDER/settings/extensions/#standard/commands/tools/string/escape_shell_argument" "$each")"'/'"'"'
            local argument_combination="$search_path/$1"
            while [[ -n "$@" ]]
            do
                shift 1
                for each in "$search_path/"**/*
                do
                    if [[ "$argument_combination" = "$each" ]]
                    then
                        # if its a folder, then we need to go deeper
                        if [[ -d "$each" ]]
                        then
                            search_path="$each"
                            argument_combination="$argument_combination/$1"
                            
                            # if there is no next argument
                            if [[ -z "$1" ]]
                            then
                                printf "\nThat is a sub folder, not a command\nValid sub-commands are\n" 1>&2
                                ls -1FL --group-directories-first --color "$each" | sed '"'"'s/^/    /'"'"' | sed -E '"'"'s/(\*|@)$/ /'"'"' 1>&2
                                return 1 # error, no command
                            fi
                            
                            break
                        # if its a file, run it with the remaining arguments
                        elif [[ -f "$each" ]]
                        then
                            "$each" "$@"
                            # make exit status identical to executed program
                            return $?
                        fi
                    fi
                done
            done
            # if an option was given
            if ! [ -z "$each" ]
            then
                echo "$each"
                printf "\nI could not find that sub-command\n" 1>&2
            fi
            printf "Valid next-arguments would be:\n" 1>&2
            ls -1FL --group-directories-first --color "$search_path" | sed '"'"'s/^/    /'"'"' | sed -E '"'"'s/(\*|@)$/ /'"'"' 1>&2
            return 1 # error, no command
        }
        __autocomplete_for__'"$name"' () {
            local commands_path='"'""$("$FORNIX_FOLDER/settings/extensions/#standard/commands/tools/string/escape_shell_argument" "$FORNIX_COMMANDS_FOLDER")""'"'
            # TODO: make this space friendly
            # TODO: make this do partial-word complete 
            function join_by { local d=${1-} f=${2-}; if shift 2; then printf %s "$f" "${@/#/$d}"; fi; }
            local item_path="$(join_by "/" $words)"
            if [ -d "$commands_path/$item_path" ]
            then
                compadd $(ls "$commands_path/$item_path")
            elif [ -d "$(dirname "$commands_path/$item_path")" ]
            then
                # check if file exists (finished completion)
                if ! [ -f "$commands_path/$item_path" ]
                then
                    # TODO: add a better check for sub-matches "java" [tab] when "java" and "javascript" exist
                    compadd $(ls "$(dirname "$commands_path/$item_path")")
                fi
            fi
            # echo "$(dirname "$commands_path/$item_path")"
        }
        compdef __autocomplete_for__'"$name"' '"$name"'
        ' > /dev/null
    fi
done < "$__temp_var__temp_folder/pipe_for_while_$__NESTED_WHILE_COUNTER";__NESTED_WHILE_COUNTER="$((__NESTED_WHILE_COUNTER - 1))"
