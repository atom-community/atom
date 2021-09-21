# copy in .vsce before changing home var 
cp "$HOME/.vsce" "$FORNIX_HOME/.vsce" 2>/dev/null

# make sure the user has this in their .vsce
# (it could contain passwords/keys)
"$FORNIX_FOLDER/settings/extensions/git/commands/ignore" "$FORNIX_HOME/.vsce"
