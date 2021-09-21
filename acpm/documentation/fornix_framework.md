# Quick Start


### How do I start the project?

Open a terminal/console app <br>
Type/Run `cd file_path/to/this/project` [ press enter ] <br>
Run `commands/start` <br>

### How do I stop the project?

Run `exit` 

### How do I add a command? (custom/project command)

For simple commands
1. Copy the `commands/project/clean` file
2. Remove all the lines except for the `#!/usr/bin/env bash` (the line at the top)
3. Rename the file to something like `commands/project/hello_world`
4. Add some bash code, ex: `echo "hello world"`
5. Start (or exit and restart) the project environment `commands/start`
6. Run `project hello_world`, and volia you're running your custom command!

Tip1: If you move your file from `commands/project/hello_world` to just `commands/hello_world` then inside the terminal you can simply run `hello_world`

Tip2: Most of the commands use bash, but they don't have to! For example, if the project uses python, you can write a python script and put `#!/usr/bin/env python` at the top

### How do I add a tool? (like git or python)

- First search for the name of your tool on [here](https://search.nixos.org/packages)
    - For example, searching `python`, you should see results like  `pythonFull`, `python39`, `python37`, etc
    - Sometimes you will see a name with a dot, like `unixtools.ps` or `python39Packages.opencv4`
- Open the `settings/requirements/nix.toml` file in the project
    - go to the very bottom, add some newlines
    - if we wanted to add `python39` we would put
    - `[[packages]]`
    - `load = [ "python39",]`
    - if the name has a dot in it (ex: `unixtools.ps`) we would do
    - `[[packages]]`
    - `load = [ "unixtools", "ps", ]`
- Then start (or exit and restart) your environment! (`commands/start`)
- Now the exact version of that tool will be available (ex: `python --version` should print out python 3.9)

# Main Features

#### What if I need a really specific version?

- If you need a very specific version, like python 3.7.0rc1
- 1. Still start [here](https://search.nixos.org/packages)
- 2. But now you want to look for the "casual" package name <img src="/documentation/images/package_name.png" alt="example showing the name: instead of the blue name">
- 3. Now go to this other (community-maintained) [website](https://lazamar.co.uk/nix-versions/)
- 4. On that other site, search using that "casual" package name, and you should see something like this. <img src="/documentation/images/package_versions.png" alt="example search results displayed as a table">
- 5. Find your version (ex: `3.7.0rc1`) then click the blue revision number next to it. You should see something like this: <img src="/documentation/images/package_from_example.png" alt="description">
- 6. Now, open up your `settings/requirements/nix.toml`
    - Scroll to the bottom and add some newlines
    - Then, for this example of python 3.7.0rc1, we would add
    - `[[packages]]`
    - `load = [ "python37Full", ]`
    - `from = "92a047a6c4d46a222e9c323ea85882d0a7a13af8"`

Note: actually all of the packages secretly have a `from = ` attribute! They simply default to using the `defaultFrom =` one inside of the `settings/extensions/nix/settings.toml` file.


### How can I auto-setup ENV variables?

Note: You can actually setup way more than just env variables, you can start virtual environments, check that modules have been installed, make sure certain folders exist, add your own functions/aliases you can even `cd` into folders (and the environment will start in that folder). The sky is the limit. And by sky I mean zsh.

TLDR: add a bash script to `settings/during_start`

Full instructions:
1. Take a look at `settings/during_start`
2. Copy one of the existing files, like `090_000_run_project_commands.sh`
3. "Pick a number"
    - Note: The number at the front of the file `090_000_` indicates the order-of-execution. Small numbers go first, big numbers go last.
    - For example, if your script needs/wants to use project commands, then make sure the number is bigger than `082_000_add_commands_to_path.sh`
    - Whatever number you pick, make sure it is unique
    - Note: If you have a huge project and run out of digits, extend all numbers. For example `082_000_` would become `082_000_000_`. (This will be automated in future versions of Fornix)
4. Write some zsh (e.g. basically bash) code
    - Don't use `.` as a path. Instead use `$FORNIX_FOLDER` which will be the root path of your project
    - ENV var example: `export PYTHON_PATH="$FORNIX_FOLDER/main:$PYTHON_PATH"`
    - Note: the `$HOME` variable will not be your home folder! it will be the `$FORNIX_HOME` (which is inside the project). 
        - Why??? 
            - Fornix was designed to solve the "Well... it works on my machine" `¯\_(ツ)_/¯` problem. Many tools (like git, and npm, and python) secretly use, create, and change all kinds of stuff in your home folder. And your home folder is almost certainly not the same as your friend's home folder, meaning "Well... it works on my machine"-problems happen all the time. By making tools think your home is inside the project, we can make them behave consistently, regardless of what you put in your personal home folder.
        - "But I neeeeed my real $HOME var!"
            - Not to worry! Take a look at "How do I add external stuff?". This is where the `settings/during_start_prep/` folder comes into play. Your actual home variable will become easier to access in future versions of Fornix.

### What should I NOT change?

Don't rename:
- `settings`
- `settings/fornix_core`
- `settings/extensions/`
- `settings/extensions/#standard`

Note:
- Everything was designed to be as customizable as possible, but due to bash/shell limitations, those are the absolute minimum number of names that need to be untouched for fornix to work at all.
- The commands folder can be changed by changing the `FORNIX_COMMANDS_FOLDER` var inside of `settings/fornix_core`
- The project's HOME env var can be changed by changing the `FORNIX_HOME` var inside of `settings/fornix_core`
- Many folders (like `settings/.cache`) will be auto-generated if deleted. However you're welcome to find the file auto-generates the folder and change it to be some other folder.

### How do I get rid of that startup message?

TLDR: change `settings/during_start_prep/010_000_setting_up_env_message.sh`

Full instructions:
- Most items in `settings/during_start`, like `094_000_jeffs_git_shortcuts.sh` are *designed* for you to edit/delete/enhance them
- NOTE: files with double underscores like: `001_000__setup_zsh__.sh` mean the file is *critical*. You can still edit it, but just know that straight-up deleting it will probably cause major parts of the system to break.
- Tip: Instead of editing files in `settings/during_start` or `during_start_prep/` for every project, fork/duplicate [Fornix](https://github.com/jeff-hykin/fornix), add all your startup customizations, then use that as a template for multiple projects!


### How do I add external stuff? (Like sudo or open-in-browser)

TLDR: add a file to `settings/during_start_prep/`, look at existing files as examples

GOTCHA's
- ENV vars created in `settings/during_start_prep/` scripts will NOT show up in your project environment (this will likely change in a future version of Fornix)
- These scripts use bash (defaulting to `GNU bash, version 4.4.23`) not zsh
- The only tools that are available are what the user already happens to have installed on their computer and in their PATH var (e.g. the tools/commands (like `grep`, `unzip`, `python`) in `nix.toml` are NOT available/setup)

NOTES:
- If you have an external tool, like `vim` setup with your based custom configs, you can inject it tool into the project environment using this tool: `"$FORNIX_FOLDER/settings/extensions/#standard/commands/tools/fornix/inject_into_path" "your_command_name"`
    - It will wrap that command, and give it access to your *real* home folder so that it can use your config files
    - Yes, the command name is really verbose, it'll probably be shortened in a future version of Fornix
- These scripts are guarenteed to have access to these ENV vars
    - `$FORNIX_FOLDER` (<- absolute path to the root of your project)
    - `$FORNIX_HOME` (<- what the HOME var will be replaced with)
    - `$FORNIX_COMMANDS_FOLDER` (<- absolute path to the commands folder)
    - `$FORNIX_DEBUG` (<- will be `"true"` if someone is debugging startup)

### How does start up actually work? (Life Cycle)

- Open up `settings/fornix_core`, and change `export FORNIX_DEBUG="false"` to `export FORNIX_DEBUG="true"`
- Run `commands/start` and it'll show you every file that is executed!


### Future documentation is on the way for:

- #### How do I add git hooks?
- #### What is manual start?
- #### How do I create a Fornix Extension?
