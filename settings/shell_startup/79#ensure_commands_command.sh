# create the "commands" command if it doesnt exist
if ! [[ -f "./settings/commands/commands" ]]; then
    echo "#!/usr/bin/env bash
    echo \"project commands:\"
    ls -1 ./settings/commands | sed 's/^/    /'
    " > "./settings/commands/commands"
fi