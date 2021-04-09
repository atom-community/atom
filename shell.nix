# Lets setup some definitions
let
    # niv should pin your current thing inside ./nix/sources
    # here we go and get that pinned version so we can pull packages out of it
    sources = import ./settings/nix/sources.nix;
    normalPackages = import sources.nixpkgs {};
    
    # pull the stdenv and lib out so we can use them if needed
    inherit (normalPackages) stdenv lib;

# using those definitions
in
    # create a shell
    normalPackages.mkShell {
        
        # inside that shell, make sure to use these packages
        buildInputs = [
            # main packages
            normalPackages.nodejs
            normalPackages.python3
            normalPackages.gcc8
            # basic commandline tools
            normalPackages.ripgrep
            normalPackages.which
            normalPackages.git
            normalPackages.colorls
            normalPackages.tree
            normalPackages.less
            normalPackages.niv
            normalPackages.cacert # needed for niv
            normalPackages.nix    # needed for niv
            # 
            # how to add packages?
            # 
            # to find package verisons use:
            #     nix-env -qP --available PACKAGE_NAME_HERE | cat
            # ex:
            #     nix-env -qP --available opencv
            # to add those specific versions find the nixpkgs.STUFF 
            # and add it here^ as normalPackages.STUFF
            # ex find:
            #     nixpkgs.python38Packages.opencv3  opencv-3.4.8
            # ex add:
            #     normalPackages.python38Packages.opencv3
            # 
            # NOTE: some things (like setuptools) just don't show up in the 
            # search results for some reason, and you just have to guess and check 🙃 
        ];
        
        shellHook = ''
        # 
        # find and run all the startup scripts in alphabetical order
        # 
        for file in ./settings/shell_startup/*
        do
            # make sure its a file
            if [[ -f $file ]]; then
                source $file
            fi
        done
        '';
    }

