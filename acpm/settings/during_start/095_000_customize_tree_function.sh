function tree {
    "$("$__FORNIX_NIX_COMMANDS/package_path_for" tree)/bin/tree" -C --dirsfirst  -A -F --noreport "$@"
}