# version 2.0 is at least the minimum (may have a higher minimum)
# sed, grep, bash/zsh required

git_checkout () {
    # 
    # if its a branch, then use switch
    # 
    __temp_var__branches="$(git branch -a | sed -e 's/remotes\/origin\/HEAD .*//' | sed -e 's/remotes\/origin\//origin /')"
    printf '%s' "$__temp_var__branches" | grep "$1" 2>/dev/null 1>/dev/null && {
        unset __temp_var__branches
        git switch "$@"
        return 
    }
    printf '%s' "$__temp_var__branches" | grep "$2" 2>/dev/null 1>/dev/null && {
        unset __temp_var__branches
        git switch "$@"
        return
    }
    unset __temp_var__branches
    # 
    # otherwise use checkout
    # 
    git checkout "$@"
    return
}

git_commit_hashes () {
    git log --reflog --oneline | sed -e 's/ .*//'
}

git_log () {
    git log --oneline
}

git_current_commit_hash () {
    # https://stackoverflow.com/questions/949314/how-to-retrieve-the-hash-for-the-current-commit-in-git
    git rev-parse HEAD
}

# 
# sync
# 
git_sync () { # git push && git pull
    args="$@"
    if [[ "$args" = "" ]]; then
        args="-"
    fi
    # https://stackoverflow.com/questions/3745135/push-git-commits-tags-simultaneously
    git add -A; git commit -m "$args"; git pull --no-edit; git submodule update --init --recursive --progress && git push
}

git_force_push () {
    args="$@"
    git push origin $args --force
}

git_force_pull () { 
    # get the latest
    git fetch --all
    # delete changes
    git_delete_changes &>/dev/null
    # reset to match origin
    git reset --hard "origin/$(git_current_branch_name)"
}

git_delete_changes () {
    # reset all the submodules
    git submodule foreach --recursive 'git stash save --keep-index --include-untracked'
    git submodule foreach --recursive 'git reset --hard'
    git submodule update --init --recursive # https://stackoverflow.com/questions/7882603/how-to-revert-a-git-submodule-pointer-to-the-commit-stored-in-the-containing-rep
    # unstage everything
    git reset --
    __temp_var__result="$(git stash save --keep-index --include-untracked)"
    
    # stash everything and delete stash
    if [[ "$__temp_var__result" == "No local changes to save" ]] 
    then
        echo "no changes to delete (just FYI)"
    else
        git stash drop
    fi
    unset __temp_var__result
}

git_keep_mine () {
    git checkout --ours .
    git add -u
    git commit -m "_Keeping all existing changes $@"
}

git_keep_theirs () { # git keep theirs 
    git checkout --theirs .
    git add -u
    git commit -m "_Accepting all incoming changes $@"
}

# 
# Branch
# 
git_current_branch_name () {
    git rev-parse --abbrev-ref HEAD
}

git_new_branch () {
    branch_name="$1"
    git switch "$(git_current_branch_name)" && git checkout -b "$branch_name" && git push --set-upstream origin "$branch_name"
}

git_delete_branch () {
    git push origin --delete "$@"
    git branch -D "$@"
}

git_delete_local_branch () {
    git branch -D "$@"
}

absolute_path () {
    echo "$(builtin cd "$(dirname "$1")"; pwd)/$(basename "$1")"
}

git_folder_as_new_branch () {
    new_branch_name="$1"
    target_folder="$2"
    if ! [ -d ".git" ]
    then
        echo "need to be in the same directory as the .git folder"
        exit 1
    fi
    
    if ! [ -d "$target_folder" ]
    then
        echo "second argument needs to be a folder that you want to be a branch"
        exit 1
    fi
    target_folder="$(absolute_path "$target_folder")"
    
    # create an empty branch (actually quite a tricky task)
    mkdir -p ./.cache/tmp/brancher
    cp -r ".git" "./.cache/tmp/brancher/.git"
    touch "./.cache/tmp/brancher/.keep"
    cd "./.cache/tmp/brancher/"
    git checkout --orphan "$new_branch_name"
    git add -A
    git commit -m "init"
    git push --set-upstream origin "$new_branch_name"
    # copy all the files
    cp -R "$target_folder"/. .
    # now add and push
    git add -A
    git commit -m "first real branch commit"
    git push
    cd ../../..
    git fetch origin "$new_branch_name"
    rm -rf "./.cache/tmp"
}

git_add_external_branch () {
    # example:
    #     git_add_external_branch "slowfast" 'https://github.com/facebookresearch/SlowFast.git' 'master'
    #     git checkout 'slowfast/master'
    __temp_var__name_for_repo="$1"
    __temp_var__url_for_repo="$2"
    __temp_var__branch_of_repo="$3"
    if [[ -z "$__temp_var__branch_of_repo" ]]
    then
        __temp_var__branch_of_repo="master"
    fi
    
    git remote add "@$__temp_var__name_for_repo" "$__temp_var__url_for_repo"
    git fetch "@$__temp_var__name_for_repo" "$__temp_var__branch_of_repo"
    git checkout -b "@$__temp_var__name_for_repo/$__temp_var__branch_of_repo" "remotes/@$__temp_var__name_for_repo/$__temp_var__branch_of_repo"
    echo "new branch is named: @$__temp_var__name_for_repo/$__temp_var__branch_of_repo"
}

git_steal_external_branch () {
    # example:
    #     git_steal_external_branch "slowfast" 'https://github.com/facebookresearch/SlowFast.git' 'master'
    #     git checkout 'slowfast/master'
    __temp_var__name_for_repo="$1"
    __temp_var__url_for_repo="$2"
    __temp_var__branch_of_repo="$3"
    if [[ -z "$__temp_var__branch_of_repo" ]]
    then
        __temp_var__branch_of_repo="master"
    fi
    
    __temp_var__new_branch_name="$__temp_var__name_for_repo/$__temp_var__branch_of_repo"
    
    # 
    # create the local/origin one
    # 
    echo "create an empty local branch" && \
    git checkout --orphan "$__temp_var__new_branch_name" && \
    echo "ignoring any files from other branches" && \
    echo "making initial commit, otherwise things break" && \
    git reset && \
    touch .keep && \
    git add .keep && \
    git commit -m 'init' && \
    echo "creating upstream branch" && \
    git push --set-upstream origin "$__temp_var__new_branch_name"
    # 
    # create the external one with @
    # 
    echo "pulling in the external data" && \
    git remote add "@$__temp_var__name_for_repo" "$__temp_var__url_for_repo" && \
    git fetch "@$__temp_var__name_for_repo" "$__temp_var__branch_of_repo" && \
    git checkout -b "@$__temp_var__name_for_repo/$__temp_var__branch_of_repo" "remotes/@$__temp_var__name_for_repo/$__temp_var__branch_of_repo" && \
    echo "merging external branch with local branch" && \
    git switch "$__temp_var__new_branch_name" && \
    git merge --allow-unrelated-histories --no-edit heads/"@$__temp_var__new_branch_name" && \
    git push  && \
    git status && \
    echo "you're now on branch: $__temp_var__new_branch_name" && \
    echo "" && \
    echo "you probably want to add all the untracked^ files to the .gitignore file"
}

git_steal_into_submodule () {
    # example:
    #     git_steal_into_submodule "slowfast" 'https://github.com/facebookresearch/SlowFast.git' 'master'  ./submodules/slow_fast
    #     git checkout '@slowfast/master'
    __temp_var__name_for_repo="$1"
    __temp_var__url_for_repo="$2"
    __temp_var__branch_of_repo="$3"
    __temp_var__path_to_submodule="$4"
    if [[ -z "$__temp_var__branch_of_repo" ]]
    then
        __temp_var__branch_of_repo="master"
    fi
    __temp_var__branch_to_go_back_to="$(git_current_branch_name)"
    
    # FIXME: follow the git_steal_external_branch pattern
    
    # echo "#" && \
    # echo "# adding remote as ""@$__temp_var__name_for_repo" && \
    # echo "#" && \
    # git remote add "@$__temp_var__name_for_repo" "$__temp_var__url_for_repo" && \
    # echo "#" && \
    # echo "# fetching that branch" && \
    # echo "#" && \
    # git fetch "@$__temp_var__name_for_repo" "$__temp_var__branch_of_repo" && \
    # echo "#" && \
    # echo "# creating our branch: ""@$__temp_var__name_for_repo/$__temp_var__branch_of_repo" && \
    # echo "#" && \
    # git checkout -b "@$__temp_var__name_for_repo/$__temp_var__branch_of_repo" "remotes/@$__temp_var__name_for_repo/$__temp_var__branch_of_repo" && \
    # git push --set-upstream origin "@$__temp_var__name_for_repo/$__temp_var__branch_of_repo" --force && \
    # echo "#" && \
    # echo "# uploading their commits: ""@$__temp_var__name_for_repo/$__temp_var__branch_of_repo" && \
    # echo "#" && \
    # git push && \
    # echo "#" && \
    # echo "# switching back to original branch: $__temp_var__branch_to_go_back_to" && \
    # echo "#" && \
    # git checkout "$__temp_var__branch_to_go_back_to" && \
    # echo "#" && \
    # echo "# adding submodule: $__temp_var__path_to_submodule" && \
    # echo "#" && \
    # git submodule add -b "@$__temp_var__name_for_repo/$__temp_var__branch_of_repo" -- "$(git config --get remote.origin.url)" "$__temp_var__path_to_submodule"
}

# 
# submodules
# 
git_pull_submodules () {
    git submodule update --init --recursive
    git submodule update --recursive --remote
}

git_push_submodules () {
    args="$@"
    if [[ "$args" = "" ]]; then
        args="-"
    fi
    git submodule foreach --recursive 'git add -A && git commit -m "'"$args"'"; git push'
}

# 
# tags 
# 
git_new_tag () {
    tag_name="$1"
    # local
    git tag "$tag_name"
    # remote
    git push origin "$tag_name"
}

git_move_tag () {
    tag_name="$1"
    new_commit_hash="$2"
    if [[ -z "$2" ]]
    then
        new_commit_hash="$(git_current_commit_hash)"
    fi
    git tag -f "$tag_name" "$new_commit_hash"
    git push --force origin "$tag_name"
}

git_delete_tag () {
    tag_name="$1"
    # global
    git push --delete origin "$tag_name"
    # local
    git tag --delete "$tag_name"
}

# 
# misc
# 
git_delete_large_file () {
    filepath="$1"
    if [[ -z "$filepath" ]]
    then
        echo "what is the path to the file you want to permantly delete?"
        read filepath
    fi
    
    # check if file exists
    if ! [[ -f "$filepath" ]]
    then
        echo "That file doesn't seem to exist"
    fi
    
    echo 
    echo "PLEASE make a backup (copy whole folder to somewhere else)"
    echo "this is a risky operation EVEN if you're sure you want to delete the file"
    echo
    echo "are you sure you want to continue?";read ANSWER;echo
    if [[ ! "$ANSWER" =~ ^[Yy] ]]
    then
        exit 0
    fi
    
    git filter-branch --index-filter "git rm -rf --cached --ignore-unmatch '$filepath'" HEAD
    echo 
    echo "Now you need to destroy everyone else's progress by force pushing if you want remote to have the fix"
    echo 
}

git_mixin () {
    url="$1"
    branch="$2"
    commit="$3"
    
    if [[ -z "$url" ]]
    then    
        echo "What is the url to the mixin?"
        read url
    fi
    
    if [[ -z "$branch" ]]
    then    
        echo "What is the branch you want to mixin? (default=master)"
        read branch
        if [[ -z "$branch" ]]
        then
            branch="master"
        fi
    fi
    
    # remove any leftover ones (caused by git merge conflicts)
    git remote remove "@__temp__" &>/dev/null
    git remote add "@__temp__" "$url"
    git fetch "@__temp__" "$branch"
    # if there was a commit
    if ! [[ -z "$commit" ]]
    then    
        # only merge that one commit
        git cherry-pick "$commit"
    else
        # merge the entire history
        git pull --allow-unrelated-histories "@__temp__" "$branch"
    fi
    git submodule update --init --recursive
    git remote remove "@__temp__" &>/dev/null
}

git_list_untracked () {
    git add -A -n
}

git_list_untracked_or_ignored () {
    git add -fAn
}

git_url_of_origin () {
    git config --get remote.origin.url
}

# self submodule
# git submodule add -b jirl --name "jirl" -- https://github.com/jeff-hykin/model_racer.git ./source/jirl

# 
# short names
# 
alias gs="git status"
alias gl="git_log"
alias gp="git_sync"
alias gm="git merge"
alias gfpull="git_force_pull"
alias gfpush="git_force_push"
alias gc="git_checkout"
alias gb="git branch -a"
alias gnb="git_new_branch"
alias gd="git_delete_changes"
alias gcp="git add -A;git stash"
alias gpst="git stash pop;git add -A"
alias gundo="git reset --soft HEAD~1"