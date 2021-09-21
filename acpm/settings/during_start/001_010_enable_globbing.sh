# 
# for zsh
# 
setopt extended_glob &>/dev/null

# 
# for bash
# 
# allow ** to search directories
shopt -s globstar &>/dev/null
# globbing can see hidden files
shopt -s dotglob &>/dev/null