#!/usr/bin/env bash


# if not in the standard env, try to make it work anyways
if [ -z "$FORNIX_FOLDER" ]
then
    # 
    # find FORNIX_FOLDER by walking up the directories
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
    export FORNIX_FOLDER="$(dirname "$(dirname "$path_to_file")")"
fi


# 
# check for python-poetry first
# 
__temp_var__should_use_poetry="false"
if [ -f "$FORNIX_FOLDER/pyproject.toml" ]
then
    # if poetry exists
    if [ -n "$(command -v "poetry")" ]
    then
        __temp_var__should_use_poetry="true"
    fi
fi
if [ "$__temp_var__should_use_poetry" = "true" ]
then
    # main inputs
    __temp_var__command_name="tools/python/check_pip_modules"
    __temp_var__file_to_watch="$FORNIX_FOLDER/pyproject.toml"
    __temp_var__hash_check_name="pip_poetry_modules"
    failed_check_command () {
        # what to do when node modules haven't been installed yet
        poetry install
        # if successful
        if [ $? -eq 0 ] 
        then
            echo "[$__temp_var__command_name] Check finished (dependencies installed)"
        # if failed
        else
            echo "[$__temp_var__command_name] Check failed: issues with install"
        fi
    }

    # ensure that the source file and hash file exist
    echo 
    echo "[$__temp_var__command_name] Checking"
    if [ -f "$__temp_var__file_to_watch" ]; then
        # 
        # create check file
        # 
        __temp_var__location_of_hash="$FORNIX_FOLDER/settings/.cache/.$__temp_var__hash_check_name.cleanable.hash"
        if ! [ -f "$__temp_var__location_of_hash" ]; then
            # make sure the folder exists
            mkdir -p "$(dirname "$__temp_var__location_of_hash")"
            touch "$__temp_var__location_of_hash"
        fi
        
        # 
        # compare check files
        # 
        __temp_var__old_hash="$(cat "$__temp_var__location_of_hash")"
        __temp_var__new_hash="$(cat "$__temp_var__file_to_watch" | md5sum)"
        # if something changed since last time; install!
        if [ "$__temp_var__old_hash" != "$__temp_var__new_hash" ]; then
            echo "$__temp_var__new_hash" > "$__temp_var__location_of_hash"
            failed_check_command
        else
            echo "[$__temp_var__command_name] Check Passed => assuming packages are installed"
        fi
        
        unset __temp_var__location_of_hash
        unset __temp_var__old_hash
        unset __temp_var__new_hash
    else
        echo "[$__temp_var__command_name] Check Passed (but only because no dependency file was found)"
    fi
    unset __temp_var__command_name
    unset __temp_var__file_to_watch
    unset __temp_var__hash_check_name
# 
# if no poetry then use normal python install
# 
else
    
    # main inputs
    __temp_var__command_name="tools/python/check_pip_modules"
    __temp_var__file_to_watch="$FORNIX_FOLDER/requirements.txt"
    __temp_var__hash_check_name="pip_modules"
    failed_check_command () {
        # what to do when node modules haven't been installed yet
        python -m pip --disable-pip-version-check install -r "$__temp_var__file_to_watch"
        # if successful
        if [ $? -eq 0 ] 
        then
            echo "[$__temp_var__command_name] Check finished (dependencies installed)"
        # if failed
        else
            echo "[$__temp_var__command_name] Check failed: issues with install"
        fi
    }

    # ensure that the source file and hash file exist
    echo 
    echo "[$__temp_var__command_name] Checking"
    if [ -f "$__temp_var__file_to_watch" ]; then
        # 
        # create check file
        # 
        __temp_var__location_of_hash="$FORNIX_FOLDER/settings/.cache/.$__temp_var__hash_check_name.cleanable.hash"
        if ! [ -f "$__temp_var__location_of_hash" ]; then
            # make sure the folder exists
            mkdir -p "$(dirname "$__temp_var__location_of_hash")"
            touch "$__temp_var__location_of_hash"
        fi
        
        # 
        # compare check files
        # 
        __temp_var__old_hash="$(cat "$__temp_var__location_of_hash")"
        __temp_var__new_hash="$(cat "$__temp_var__file_to_watch" | md5sum)"
        # if something changed since last time; install!
        if [ "$__temp_var__old_hash" != "$__temp_var__new_hash" ]; then
            echo "$__temp_var__new_hash" > "$__temp_var__location_of_hash"
            failed_check_command
        else
            echo "[$__temp_var__command_name] Check Passed => assuming packages are installed"
        fi
        
        unset __temp_var__location_of_hash
        unset __temp_var__old_hash
        unset __temp_var__new_hash
    else
        echo "[$__temp_var__command_name] Check Passed (but only because no dependency file was found)"
    fi
    unset __temp_var__command_name
    unset __temp_var__file_to_watch
    unset __temp_var__hash_check_name
fi