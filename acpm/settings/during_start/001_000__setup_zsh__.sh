# 
# import paths from nix
# 
zsh_syntax_highlighting__path="$("$__FORNIX_NIX_COMMANDS/package_path_for" zsh-syntax-highlighting)"
zsh_auto_suggest__path="$("$__FORNIX_NIX_COMMANDS/package_path_for" zsh-autosuggestions)"
spaceship_prompt__path="$("$__FORNIX_NIX_COMMANDS/package_path_for" spaceship-prompt)"
oh_my_zsh__path="$("$__FORNIX_NIX_COMMANDS/package_path_for" oh-my-zsh)"
zsh__path="$("$__FORNIX_NIX_COMMANDS/package_path_for" zsh)"

# 
# set fpath for zsh
# 
local_zsh="$FORNIX_FOLDER/settings/.cache/zsh.do_not_sync/site-functions/"
mkdir -p "$local_zsh"

export fpath=("$local_zsh")
export fpath=("$oh_my_zsh__path"/share/oh-my-zsh/functions $fpath)
export fpath=("$oh_my_zsh__path"/share/oh-my-zsh/completions $fpath)
export fpath=("$zsh__path"/share/zsh/site-functions $fpath)
export fpath=("$zsh__path"/share/zsh/*/functions $fpath)

# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="robbyrussell" # default

# 
# add spaceship-prompt theme
# 
ln -fs "$spaceship_prompt__path/lib/spaceship-prompt/spaceship.zsh" "$local_zsh"prompt_spaceship_setup

export ZSH="$oh_my_zsh__path/share/oh-my-zsh"
. "$ZSH/oh-my-zsh.sh"

# 
# enable syntax highlighing
# 
export ZSH_HIGHLIGHT_HIGHLIGHTERS_DIR="$zsh_syntax_highlighting__path/share/zsh-syntax-highlighting/highlighters"
. "$ZSH_HIGHLIGHT_HIGHLIGHTERS_DIR/../zsh-syntax-highlighting.zsh"

# 
# enable auto suggestions
# 
. "$zsh_auto_suggest__path/share/zsh-autosuggestions/zsh-autosuggestions.zsh"

SPACESHIP_CHAR_SYMBOL="∫ " # ☣ ⁂ ⌘ ∴ ∮ ֎ Ͽ ♫ ⛬ ⚿ ♦ ♢ ⛶ ✾ ❒ ⟩ ⟡ ⟜ ⟦ ⦊ ⦒ ⪢ ⪾ ∫ ∬ ∭
SPACESHIP_VENV_SYMBOL="🐍$(python -V 2>&1 | sed -E 's/Python//g' )"
SPACESHIP_VENV_PREFIX=""
SPACESHIP_VENV_GENERIC_NAMES="."
SPACESHIP_VENV_COLOR="green"
SPACESHIP_NODE_COLOR="yellow"

# Set Spaceship ZSH as a prompt
autoload -U promptinit; promptinit
prompt spaceship

# enable auto complete
autoload -Uz compinit
compinit

autoload bashcompinit
bashcompinit

unalias -m '*' # remove all default aliases