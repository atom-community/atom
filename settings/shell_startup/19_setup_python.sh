# 
# if on a mac
# 
if [[ "$OSTYPE" == "darwin"* ]]
then
    # use the virual enviornment
    # because nix-opencv doesn't setup correctly for mac
    # and I can't figure out how to override the videoio setting
    # relevent link to the nix build-opencv: https://github.com/NixOS/nixpkgs/blob/193a6a2307b7b29aa11bee309d4aa41840686ab0/pkgs/development/libraries/opencv/4.x.nix#L258
    ls .venv &>/dev/null || python -m venv .venv
    source .venv/bin/activate
# 
# linux
# 
else
    # nix-opencv runs but has an error opening video files
    # ("Can't find starting number (in the name of file)" and the standard solutions don't work)
    # virual enviornment opencv breaks for linux
    # (it can't find the shared object files for C/C++ libs)
    # 
    # I can't figure out an automated solution to either of those 
    # so on linux we don't use either of them, and instead we use the system python
    # (which is bad because they keep track of verions, and the system one doesn't)
    # oh well
    # the below code does its best to check the system versions and install the missing parts
    
    # 
    # pip3 check
    #
    pip_from_system="/usr/bin/pip3"
    if ! [[ -f "$pip_from_system" ]]
    then
        echo 
        echo "It appears you don't have pip3 (I looked at /usr/bin/pip3)"
        echo "I'll try to install python for you using this commands:"
        echo "    sudo apt-get update"
        echo "    sudo apt-get install -y python3-pip"
        echo 
        
        sudo apt-get update
        sudo apt-get install -y python3-pip
    fi
    # check again for pip3 encase the installtion went bad
    if ! [[ -f "$pip_from_system" ]]
    then
        echo "it looks like pip3 still isn't installed."
        echo "I'll let the rest of the project load but it will likely be broken"
    else
        
        # 
        # python3 check
        # 
        # make sure python3 is installed
        python_from_system="/usr/bin/python3"
        if ! [[ -f "$python_from_system" ]]
        then
            echo 
            echo "It appears you don't have python3 (I looked at /usr/bin/python3)"
            echo "I'll try to install python for you using this commands:"
            echo "    sudo apt-get update"
            echo "    sudo apt-get install -y python3"
            echo 
            
            sudo apt-get update
            sudo apt-get install -y python3
        fi
        # check again for python3 encase the installtion went bad
        if ! [[ -f "$python_from_system" ]]
        then
            echo "it looks like python3 still isn't installed."
            echo "I'll let the rest of the project load but it will likely be broken"
        # if python3 exists
        else
        
            # 
            # opencv check
            # 
            # look for the opencv installation
            cv2_shared_object_file="$("$python_from_system" -c "import cv2; print(cv2.__file__)")"
            if ! [[ -f "$cv2_shared_object_file" ]] 
            then
                echo it appears you dont have the full opencv installed
                echo I will try to install it with these commands:
                echo "    sudo apt-get update"
                echo "    sudo apt-get install -y python3-opencv"
                echo 
                echo "Note: your system may need to be restarted"
                echo "(it will mention if it does)"
                
                sudo apt-get update
                sudo apt-get install -y python3-opencv
            fi
        fi
    fi
fi