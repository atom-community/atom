# quick command for resuming paused processes
# (paused using ctrl+z)
resume () {
    if [[ -z "$1" ]]
    then
            which_process="%1" 
    else
            which_process="$1" 
    fi
    kill -s CONT "$which_process"
    fg "$which_process"
}
