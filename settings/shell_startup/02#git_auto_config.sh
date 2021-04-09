# if there's no pull setting, then make a local one
git config pull.rebase &>/dev/null || git config pull.ff &>/dev/null || git config --add pull.rebase false &>/dev/null