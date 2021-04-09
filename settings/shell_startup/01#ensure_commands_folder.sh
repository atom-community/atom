# ensure commands folder exists
if ! [[ -d "./settings/commands" ]]; then
    # remove a potenial file
    rm -f ./settings/commands
    # make the folder
    mkdir ./settings/commands
fi