#!/usr/bin/env bash
for dir in ./settings/git/hooks/*
do
    git_file=".git/hooks/$(basename $dir)"
    # ensure all the git hook files exist
    touch $git_file
    # make sure each calls the hooks
    cat $git_file | grep "#START: xd-nix-hooks (don't delete)"  &>/dev/null || echo "
        #START: xd-nix-hooks (don't delete)
        for hook in './settings/git/hooks/$(basename $dir)/'*
        do
            source \$hook
        done
        #END: xd-nix-hooks (don't delete)
    " >> $git_file
    # ensure its executable
    chmod ugo+x "$git_file" &>/dev/null || sudo chmod ugo+x "$git_file"
done