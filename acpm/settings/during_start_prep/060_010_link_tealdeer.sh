# connect the tealdeer cache to prevent wasted duplicates
if [[ -d "$HOME/.cache/tealdeer" ]]
then
    if ! [[ -d "$FORNIX_HOME/.cache/tealdeer" ]]
    then
        ln -s "$HOME/.cache/tealdeer" "$FORNIX_HOME/.cache/tealdeer"
    fi
fi