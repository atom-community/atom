doit () {
    # sudo but preserve path and other env vars
    sudo -E env "PATH=$PATH" "$@"
}