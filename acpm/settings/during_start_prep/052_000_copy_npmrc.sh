# copy in .npmrc before changing home var 
cp "$HOME/.npmrc" "$FORNIX_HOME/.npmrc" 2>/dev/null

# make sure the user has this in their .npmrc
# (it could contain passwords/keys)
"$FORNIX_FOLDER/settings/extensions/git/commands/ignore" "$FORNIX_HOME/.npmrc"
