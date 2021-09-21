# copy in gitconfig before changing home var 
# check if file exists
if [ -f ""$HOME/.gitconfig"" ]
then
    cp "$HOME/.gitconfig" "$FORNIX_HOME/.gitconfig" 2>/dev/null
fi

# make sure the user has this in their gitignore 
# (the config could contain passwords/keys)
"$FORNIX_FOLDER/settings/extensions/git/commands/ignore" "$FORNIX_HOME/.gitconfig"