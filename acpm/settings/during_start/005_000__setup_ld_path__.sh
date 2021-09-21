# add the path to the c lib, which prevents the libstdc++.so.6 errors 
export LD_LIBRARY_PATH="$("$__FORNIX_NIX_COMMANDS/lib_path_for" "cc"):$LD_LIBRARY_PATH"
# add these for opencv/numpy
export LD_LIBRARY_PATH="$("$__FORNIX_NIX_COMMANDS/lib_path_for" libglvnd):$LD_LIBRARY_PATH"
export LD_LIBRARY_PATH="$("$__FORNIX_NIX_COMMANDS/lib_path_for" glib):$LD_LIBRARY_PATH"
