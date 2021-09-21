# 
# "exa" is used as a better form of ls
# 
__temp_set_exa_colors () {
    #
    # styles
    # 
    local bold=1
    local dim=2
    local underline=4
    # 
    # colors
    # 
    __temp_rgb_color () {
        printf "38;5;$1"
    }
    local red=31
    local green=32
    local yellow=33
    local blue=34
    local purple=35
    local cyan=36
    local white=37
    # 
    # groups (not part of exa, just manually created/used)
    # 
    local code_color="$green"
    local image_color="$cyan"
    local video_color="$yellow"
    local document_color="$purple"
    local config_color="$cyan"
    local read_color="$green"
    local write_color="$yellow"
    local execute_color="$red"
    local user_and_group_color="$cyan"
    local big_files="$green;$bold"
    local medium_files="$blue"
    local small_files="$white;$dim"
    
    # 
    # full names (defined by exa)
    # 
    local directories="di"
    local executable_files="ex"
    local regular_files="fi"
    local named_pipes="pi"
    local sockets="so"
    local block_devices="bd"
    local character_devices="cd"
    local symlinks="ln"
    local symlinks_with_no_target="or"
    local the_user_read_permission_bit="ur"
    local the_user_write_permission_bit="uw"
    local the_user_execute_permission_bit_for_regular_files="ux"
    local the_user_execute_for_other_file_kinds="ue"
    local the_group_read_permission_bit="gr"
    local the_group_write_permission_bit="gw"
    local the_group_execute_permission_bit="gx"
    local the_others_read_permission_bit="tr"
    local the_others_write_permission_bit="tw"
    local the_others_execute_permission_bit="tx"
    local higher_bits_for_files="su"
    local higher_bits_for_non_files="sf"
    local extended_attribute_marker="xa" 
    local setuid_setgid_and_sticky_permission_bits_for_files="su"
    local setuid_setgid_and_sticky_for_other_file_kinds="sf"
    local the_extended_attribute_indicator="xa"
    local the_numbers_of_a_files_size_sets_nb_nk_nm_ng_and_nh="sn"
    local the_numbers_of_a_files_size_if_it_is_lower_than_1_kb_or_kib="nb"
    local the_numbers_of_a_files_size_if_it_is_between_1_kb_or_ki_b_and_1_mb_or_mi_b="nk"
    local the_numbers_of_a_files_size_if_it_is_between_1_mb_or_mi_b_and_1_gb_or_gi_b="nm"
    local the_numbers_of_a_files_size_if_it_is_between_1_gb_or_gi_b_and_1_tb_or_ti_b="ng"
    local the_numbers_of_a_files_size_if_it_is_1_tb_or_ti_b_or_higher="nt"
    local the_units_of_a_files_size_sets_ub_uk_um_ug_and_uh="sb"
    local the_units_of_a_files_size_if_it_is_lower_than_1_kb_or_kib="ub"
    local the_units_of_a_files_size_if_it_is_between_1_kb_or_ki_b_and_1_mb_or_mi_b="uk"
    local the_units_of_a_files_size_if_it_is_between_1_mb_or_mi_b_and_1_gb_or_gi_b="um"
    local the_units_of_a_files_size_if_it_is_between_1_gb_or_gi_b_and_1_tb_or_ti_b="ug"
    local the_units_of_a_files_size_if_it_is_1_tb_or_ti_b_or_higher="ut"
    local a_devices_major_id="df"
    local a_devices_minor_id="ds"
    local a_user_thats_you="uu"
    local a_user_thats_someone_else="un"
    local a_group_that_you_belong_to="gu"
    local a_group_you_arent_a_member_of="gn"
    local a_number_of_hard_links="lc"
    local a_number_of_hard_links_for_a_regular_file_with_at_least_two="lm"
    local a_new_flag_in_git="ga"
    local a_modified_flag_in_git="gm"
    local a_deleted_flag_in_git="gd"
    local a_renamed_flag_in_git="gv"
    local a_modified_metadata_flag_in_git="gt"
    local punctuation_including_many_background_ui_elements="xx"
    local a_files_date="da"
    local a_files_inode_number="in"
    local a_files_number_of_blocks="bl"
    local the_header_row_of_a_table="hd"
    local the_path_of_a_symlink="lp"
    local an_escaped_character_in_a_filename="cc"
    local the_overlay_style_for_broken_symlink_paths="bO"
    
    # manual/raw
    export EXA_COLORS="reset:
    # 
    # file extensions
    #
        # hidden types
        :.*=$dim:$higher_bits_for_files=$dim:$higher_bits_for_non_files=$dim:$extended_attribute_marker=$dim:
        # doc types
        :*.pdf=$document_color:*.md=$document_color:*.html=$document_color:*.tex=$document_color:*.djvu=$document_color:*.doc=$document_color:*.docx=$document_color:*.dvi=$document_color:*.eml=$document_color:*.eps=$document_color:*.fotd=$document_color:*.key=$document_color:*.odp=$document_color:*.odt=$document_color:*.ppt=$document_color:*.pptx=$document_color:*.rtf=$document_color:*.xls=$document_color:*.xlsx=$document_color:
        # config types
        :*.cfg=$config_color:*.json=$config_color:*.yaml=$config_color:*.toml=$config_color:*.xml:*.ini=$config_color:
        # image types
        :*.arw=$image_color:*.bmp=$image_color:*.cbr=$image_color:*.cbz=$image_color:*.cr2=$image_color:*.dvi=$image_color:*.eps=$image_color:*.gif=$image_color:*.heif=$image_color:*.ico=$image_color:*.jpeg=$image_color:*.jpg=$image_color:*.nef=$image_color:*.orf=$image_color:*.pbm=$image_color:*.pgm=$image_color:*.png=$image_color:*.pnm=$image_color:*.ppm=$image_color:*.ps=$image_color:*.raw=$image_color:*.stl=$image_color:*.svg=$image_color:*.tif=$image_color:*.tiff=$image_color:*.webp=$image_color:*.xpm=$image_color:
        
        # video types
        :*.avi=$video_color:*.flv=$video_color:*.hei=$video_color: *.m2t=$video_color: *.m2v=$video_color:*.mkv=$video_color:*.mov=$video_color:*.mp4=$video_color:*.mpe=$video_color: *.mpg=$video_color:*.ogm=$video_color:*.ogv=$video_color:*.ts =$video_color:.vob=$video_color:*.web=$video_color: *.wmv=$video_color:
        
        # TODO audio types and more video types
        # code types (from: https://gist.github.com/ppisarczyk/43962d06686722d26d176fad46879d41)
        :*.abap=$code_color:*.asc=$code_color:*.ash=$code_color:*.ampl=$code_color:*.mod=$code_color:*.g4=$code_color:*.apl=$code_color:*.dyalog=$code_color:*.asp=$code_color:*.asax=$code_color:*.ascx=$code_color:*.ashx=$code_color:*.asmx=$code_color:*.aspx=$code_color:*.axd=$code_color:*.dats=$code_color:*.hats=$code_color:*.sats=$code_color:*.as=$code_color:*.adb=$code_color:*.ada=$code_color:*.ads=$code_color:*.agda=$code_color:*.als=$code_color:*.cls=$code_color:*.applescript=$code_color:*.scpt=$code_color:*.arc=$code_color:*.ino=$code_color:*.aj=$code_color:*.asm=$code_color:*.a51=$code_color:*.inc=$code_color:*.nasm=$code_color:*.aug=$code_color:*.ahk=$code_color:*.ahkl=$code_color:*.au3=$code_color:*.awk=$code_color:*.auk=$code_color:*.gawk=$code_color:*.mawk=$code_color:*.nawk=$code_color:*.bat=$code_color:*.cmd=$code_color:*.befunge=$code_color:*.bison=$code_color:*.bb=$code_color:*.bb=$code_color:*.decls=$code_color:*.bmx=$code_color:*.bsv=$code_color:*.boo=$code_color:*.b=$code_color:*.bf=$code_color:*.brs=$code_color:*.bro=$code_color:*.c=$code_color:*.cats=$code_color:*.h=$code_color:*.idc=$code_color:*.w=$code_color:*.cs=$code_color:*.cake=$code_color:*.cshtml=$code_color:*.csx=$code_color:*.cpp=$code_color:*.c++=$code_color:*.cc=$code_color:*.cp=$code_color:*.cxx=$code_color:*.h=$code_color:*.h++=$code_color:*.hh=$code_color:*.hpp=$code_color:*.hxx=$code_color:*.inc=$code_color:*.inl=$code_color:*.ipp=$code_color:*.tcc=$code_color:*.tpp=$code_color:*.chs=$code_color:*.clp=$code_color:*.cmake=$code_color:*.cmake.in=$code_color:*.cob=$code_color:*.cbl=$code_color:*.ccp=$code_color:*.cobol=$code_color:*.cpy=$code_color:*.capnp=$code_color:*.mss=$code_color:*.ceylon=$code_color:*.chpl=$code_color:*.ch=$code_color:*.ck=$code_color:*.cirru=$code_color:*.clw=$code_color:*.icl=$code_color:*.dcl=$code_color:*.click=$code_color:*.clj=$code_color:*.boot=$code_color:*.cl2=$code_color:*.cljc=$code_color:*.cljs=$code_color:*.cljs.hl=$code_color:*.cljscm=$code_color:*.cljx=$code_color:*.hic=$code_color:*.coffee=$code_color:*._coffee=$code_color:*.cake=$code_color:*.cjsx=$code_color:*.cson=$code_color:*.iced=$code_color:*.cfm=$code_color:*.cfml=$code_color:*.cfc=$code_color:*.lisp=$code_color:*.asd=$code_color:*.cl=$code_color:*.l=$code_color:*.lsp=$code_color:*.ny=$code_color:*.podsl=$code_color:*.sexp=$code_color:*.cp=$code_color:*.cps=$code_color:*.cl=$code_color:*.coq=$code_color:*.v=$code_color:*.cr=$code_color:*.feature=$code_color:*.cu=$code_color:*.cuh=$code_color:*.cy=$code_color:*.pyx=$code_color:*.pxd=$code_color:*.pxi=$code_color:*.d=$code_color:*.di=$code_color:*.com=$code_color:*.dm=$code_color:*.d=$code_color:*.dart=$code_color:*.djs=$code_color:*.dylan=$code_color:*.dyl=$code_color:*.intr=$code_color:*.lid=$code_color:*.E=$code_color:*.ecl=$code_color:*.eclxml=$code_color:*.ecl=$code_color:*.e=$code_color:*.ex=$code_color:*.exs=$code_color:*.elm=$code_color:*.el=$code_color:*.emacs=$code_color:*.emacs.desktop=$code_color:*.em=$code_color:*.emberscript=$code_color:*.erl=$code_color:*.es=$code_color:*.escript=$code_color:*.hrl=$code_color:*.xrl=$code_color:*.yrl=$code_color:*.fs=$code_color:*.fsi=$code_color:*.fsx=$code_color:*.fx=$code_color:*.flux=$code_color:*.f90=$code_color:*.f=$code_color:*.f03=$code_color:*.f08=$code_color:*.f77=$code_color:*.f95=$code_color:*.for=$code_color:*.fpp=$code_color:*.factor=$code_color:*.fy=$code_color:*.fancypack=$code_color:*.fan=$code_color:*.fs=$code_color:*.fth=$code_color:*.4th=$code_color:*.f=$code_color:*.for=$code_color:*.forth=$code_color:*.fr=$code_color:*.frt=$code_color:*.fs=$code_color:*.ftl=$code_color:*.fr=$code_color:*.gms=$code_color:*.g=$code_color:*.gap=$code_color:*.gd=$code_color:*.gi=$code_color:*.tst=$code_color:*.s=$code_color:*.ms=$code_color:*.gd=$code_color:*.glsl=$code_color:*.fp=$code_color:*.frag=$code_color:*.frg=$code_color:*.fs=$code_color:*.fsh=$code_color:*.fshader=$code_color:*.geo=$code_color:*.geom=$code_color:*.glslv=$code_color:*.gshader=$code_color:*.shader=$code_color:*.vert=$code_color:*.vrx=$code_color:*.vsh=$code_color:*.vshader=$code_color:*.gml=$code_color:*.kid=$code_color:*.ebuild=$code_color:*.eclass=$code_color:*.glf=$code_color:*.gp=$code_color:*.gnu=$code_color:*.gnuplot=$code_color:*.plot=$code_color:*.plt=$code_color:*.go=$code_color:*.golo=$code_color:*.gs=$code_color:*.gst=$code_color:*.gsx=$code_color:*.vark=$code_color:*.grace=$code_color:*.gf=$code_color:*.groovy=$code_color:*.grt=$code_color:*.gtpl=$code_color:*.gvy=$code_color:*.gsp=$code_color:*.hcl=$code_color:*.tf=$code_color:*.hlsl=$code_color:*.fx=$code_color:*.fxh=$code_color:*.hlsli=$code_color:*.hh=$code_color:*.php=$code_color:*.hb=$code_color:*.hs=$code_color:*.hsc=$code_color:*.hx=$code_color:*.hxsl=$code_color:*.hy=$code_color:*.bf=$code_color:*.pro=$code_color:*.dlm=$code_color:*.ipf=$code_color:*.idr=$code_color:*.lidr=$code_color:*.ni=$code_color:*.i7x=$code_color:*.iss=$code_color:*.io=$code_color:*.ik=$code_color:*.thy=$code_color:*.ijs=$code_color:*.flex=$code_color:*.jflex=$code_color:*.jq=$code_color:*.jsx=$code_color:*.j=$code_color:*.java=$code_color:*.jsp=$code_color:*.js=$code_color:*._js=$code_color:*.bones=$code_color:*.es=$code_color:*.es6=$code_color:*.frag=$code_color:*.gs=$code_color:*.jake=$code_color:*.jsb=$code_color:*.jscad=$code_color:*.jsfl=$code_color:*.jsm=$code_color:*.jss=$code_color:*.njs=$code_color:*.pac=$code_color:*.sjs=$code_color:*.ssjs=$code_color:*.sublime-build=$code_color:*.sublime-commands=$code_color:*.sublime-completions=$code_color:*.sublime-keymap=$code_color:*.sublime-macro=$code_color:*.sublime-menu=$code_color:*.sublime-mousemap=$code_color:*.sublime-project=$code_color:*.sublime-settings=$code_color:*.sublime-theme=$code_color:*.sublime-workspace=$code_color:*.sublime_metrics=$code_color:*.sublime_session=$code_color:*.xsjs=$code_color:*.xsjslib=$code_color:*.jl=$code_color:*.krl=$code_color:*.sch=$code_color:*.brd=$code_color:*.kicad_pcb=$code_color:*.kt=$code_color:*.ktm=$code_color:*.kts=$code_color:*.lfe=$code_color:*.ll=$code_color:*.lol=$code_color:*.lsl=$code_color:*.lslp=$code_color:*.lvproj=$code_color:*.lasso=$code_color:*.las=$code_color:*.lasso8=$code_color:*.lasso9=$code_color:*.ldml=$code_color:*.lean=$code_color:*.hlean=$code_color:*.l=$code_color:*.lex=$code_color:*.ly=$code_color:*.ily=$code_color:*.b=$code_color:*.m=$code_color:*.lagda=$code_color:*.litcoffee=$code_color:*.lhs=$code_color:*.ls=$code_color:*._ls=$code_color:*.xm=$code_color:*.x=$code_color:*.xi=$code_color:*.lgt=$code_color:*.logtalk=$code_color:*.lookml=$code_color:*.ls=$code_color:*.lua=$code_color:*.fcgi=$code_color:*.nse=$code_color:*.pd_lua=$code_color:*.rbxs=$code_color:*.wlua=$code_color:*.mumps=$code_color:*.m=$code_color:*.m4=$code_color:*.m4=$code_color:*.ms=$code_color:*.mcr=$code_color:*.muf=$code_color:*.m=$code_color:*.mak=$code_color:*.d=$code_color:*.mk=$code_color:*.mkfile=$code_color:*.mako=$code_color:*.mao=$code_color:*.mathematica=$code_color:*.cdf=$code_color:*.m=$code_color:*.ma=$code_color:*.mt=$code_color:*.nb=$code_color:*.nbp=$code_color:*.wl=$code_color:*.wlt=$code_color:*.matlab=$code_color:*.m=$code_color:*.maxpat=$code_color:*.maxhelp=$code_color:*.maxproj=$code_color:*.mxt=$code_color:*.pat=$code_color:*.m=$code_color:*.moo=$code_color:*.metal=$code_color:*.minid=$code_color:*.druby=$code_color:*.duby=$code_color:*.mir=$code_color:*.mirah=$code_color:*.mo=$code_color:*.mod=$code_color:*.mms=$code_color:*.mmk=$code_color:*.monkey=$code_color:*.moo=$code_color:*.moon=$code_color:*.myt=$code_color:*.ncl=$code_color:*.nsi=$code_color:*.nsh=$code_color:*.n=$code_color:*.axs=$code_color:*.axi=$code_color:*.axs.erb=$code_color:*.axi.erb=$code_color:*.nlogo=$code_color:*.nl=$code_color:*.lisp=$code_color:*.lsp=$code_color:*.nim=$code_color:*.nimrod=$code_color:*.nit=$code_color:*.nix=$code_color:*.nu=$code_color:*.numpy=$code_color:*.numpyw=$code_color:*.numsc=$code_color:*.ml=$code_color:*.eliom=$code_color:*.eliomi=$code_color:*.ml4=$code_color:*.mli=$code_color:*.mll=$code_color:*.mly=$code_color:*.m=$code_color:*.h=$code_color:*.mm=$code_color:*.j=$code_color:*.sj=$code_color:*.omgrofl=$code_color:*.opa=$code_color:*.opal=$code_color:*.cl=$code_color:*.opencl=$code_color:*.p=$code_color:*.cls=$code_color:*.scad=$code_color:*.ox=$code_color:*.oxh=$code_color:*.oxo=$code_color:*.oxygene=$code_color:*.oz=$code_color:*.pwn=$code_color:*.inc=$code_color:*.php=$code_color:*.aw=$code_color:*.ctp=$code_color:*.fcgi=$code_color:*.inc=$code_color:*.php3=$code_color:*.php4=$code_color:*.php5=$code_color:*.phps=$code_color:*.phpt=$code_color:*.pls=$code_color:*.pck=$code_color:*.pkb=$code_color:*.pks=$code_color:*.plb=$code_color:*.plsql=$code_color:*.sql=$code_color:*.sql=$code_color:*.pov=$code_color:*.inc=$code_color:*.pan=$code_color:*.psc=$code_color:*.parrot=$code_color:*.pasm=$code_color:*.pir=$code_color:*.pas=$code_color:*.dfm=$code_color:*.dpr=$code_color:*.inc=$code_color:*.lpr=$code_color:*.pp=$code_color:*.pl=$code_color:*.al=$code_color:*.cgi=$code_color:*.fcgi=$code_color:*.perl=$code_color:*.ph=$code_color:*.plx=$code_color:*.pm=$code_color:*.pod=$code_color:*.psgi=$code_color:*.t=$code_color:*.6pl=$code_color:*.6pm=$code_color:*.nqp=$code_color:*.p6=$code_color:*.p6l=$code_color:*.p6m=$code_color:*.pl=$code_color:*.pl6=$code_color:*.pm=$code_color:*.pm6=$code_color:*.t=$code_color:*.l=$code_color:*.pig=$code_color:*.pike=$code_color:*.pmod=$code_color:*.pogo=$code_color:*.pony=$code_color:*.ps1=$code_color:*.psd1=$code_color:*.psm1=$code_color:*.pde=$code_color:*.pl=$code_color:*.pro=$code_color:*.prolog=$code_color:*.yap=$code_color:*.spin=$code_color:*.pp=$code_color:*.pd=$code_color:*.pb=$code_color:*.pbi=$code_color:*.purs=$code_color:*.py=$code_color:*.bzl=$code_color:*.cgi=$code_color:*.fcgi=$code_color:*.gyp=$code_color:*.lmi=$code_color:*.pyde=$code_color:*.pyp=$code_color:*.pyt=$code_color:*.pyw=$code_color:*.rpy=$code_color:*.tac=$code_color:*.wsgi=$code_color:*.xpy=$code_color:*.qml=$code_color:*.qbs=$code_color:*.pro=$code_color:*.pri=$code_color:*.r=$code_color:*.rd=$code_color:*.rsx=$code_color:*.rbbas=$code_color:*.rbfrm=$code_color:*.rbmnu=$code_color:*.rbres=$code_color:*.rbtbar=$code_color:*.rbuistate=$code_color:*.rkt=$code_color:*.rktd=$code_color:*.rktl=$code_color:*.scrbl=$code_color:*.rl=$code_color:*.reb=$code_color:*.r=$code_color:*.r2=$code_color:*.r3=$code_color:*.rebol=$code_color:*.red=$code_color:*.reds=$code_color:*.cw=$code_color:*.rpy=$code_color:*.rs=$code_color:*.rsh=$code_color:*.robot=$code_color:*.rg=$code_color:*.rb=$code_color:*.builder=$code_color:*.fcgi=$code_color:*.gemspec=$code_color:*.god=$code_color:*.irbrc=$code_color:*.jbuilder=$code_color:*.mspec=$code_color:*.pluginspec=$code_color:*.podspec=$code_color:*.rabl=$code_color:*.rake=$code_color:*.rbuild=$code_color:*.rbw=$code_color:*.rbx=$code_color:*.ru=$code_color:*.ruby=$code_color:*.thor=$code_color:*.watchr=$code_color:*.rs=$code_color:*.rs.in=$code_color:*.sas=$code_color:*.smt2=$code_color:*.smt=$code_color:*.sqf=$code_color:*.hqf=$code_color:*.sql=$code_color:*.db2=$code_color:*.sage=$code_color:*.sagews=$code_color:*.sls=$code_color:*.scala=$code_color:*.sbt=$code_color:*.sc=$code_color:*.scm=$code_color:*.sld=$code_color:*.sls=$code_color:*.sps=$code_color:*.ss=$code_color:*.sci=$code_color:*.sce=$code_color:*.tst=$code_color:*.self=$code_color:*.sh=$code_color:*.bash=$code_color:*.bats=$code_color:*.cgi=$code_color:*.command=$code_color:*.fcgi=$code_color:*.ksh=$code_color:*.sh.in=$code_color:*.tmux=$code_color:*.tool=$code_color:*.zsh=$code_color:*.sh-session=$code_color:*.shen=$code_color:*.sl=$code_color:*.smali=$code_color:*.st=$code_color:*.cs=$code_color:*.tpl=$code_color:*.sp=$code_color:*.inc=$code_color:*.sma=$code_color:*.nut=$code_color:*.stan=$code_color:*.ML=$code_color:*.fun=$code_color:*.sig=$code_color:*.sml=$code_color:*.do=$code_color:*.ado=$code_color:*.doh=$code_color:*.ihlp=$code_color:*.mata=$code_color:*.matah=$code_color:*.sthlp=$code_color:*.sc=$code_color:*.scd=$code_color:*.swift=$code_color:*.sv=$code_color:*.svh=$code_color:*.vh=$code_color:*.txl=$code_color:*.tcl=$code_color:*.adp=$code_color:*.tm=$code_color:*.tcsh=$code_color:*.csh=$code_color:*.t=$code_color:*.thrift=$code_color:*.t=$code_color:*.tu=$code_color:*.ts=$code_color:*.tsx=$code_color:*.upc=$code_color:*.uno=$code_color:*.uc=$code_color:*.ur=$code_color:*.urs=$code_color:*.vcl=$code_color:*.vhdl=$code_color:*.vhd=$code_color:*.vhf=$code_color:*.vhi=$code_color:*.vho=$code_color:*.vhs=$code_color:*.vht=$code_color:*.vhw=$code_color:*.vala=$code_color:*.vapi=$code_color:*.v=$code_color:*.veo=$code_color:*.vim=$code_color:*.vb=$code_color:*.bas=$code_color:*.cls=$code_color:*.frm=$code_color:*.frx=$code_color:*.vba=$code_color:*.vbhtml=$code_color:*.vbs=$code_color:*.volt=$code_color:*.webidl=$code_color:*.x10=$code_color:*.xc=$code_color:*.xsp-config=$code_color:*.xsp.metadata=$code_color:*.xpl=$code_color:*.xproc=$code_color:*.xquery=$code_color:*.xq=$code_color:*.xql=$code_color:*.xqm=$code_color:*.xqy=$code_color:*.xs=$code_color:*.xslt=$code_color:*.xsl=$code_color:*.xojo_code=$code_color:*.xojo_menu=$code_color:*.xojo_report=$code_color:*.xojo_script=$code_color:*.xojo_toolbar=$code_color:*.xojo_window=$code_color:*.xtend=$code_color:*.y=$code_color:*.yacc=$code_color:*.yy=$code_color:*.zep=$code_color:*.zimpl=$code_color:*.zmpl=$code_color:*.zpl=$code_color:*.ec=$code_color:*.eh=$code_color:*.fish=$code_color:*.mu=$code_color:*.nc=$code_color:*.ooc=$code_color:*.wisp=$code_color:*.prg=$code_color:*.ch=$code_color:*.prw=$code_color:*.dockerfile=$code_color:
        
    # file kind
    :$executable_files=$execute_color:
    :$the_path_of_a_symlink=$purple;$underline:
    
    # read
    :$the_user_read_permission_bit=$read_color;$dim:$the_group_read_permission_bit=$read_color;$dim:$the_others_read_permission_bit=$read_color;$dim:
    # write
    :$the_user_write_permission_bit=$write_color;$dim:$the_group_write_permission_bit=$write_color;$dim:$the_others_write_permission_bit=$write_color;$dim:
    # execute
    :$the_user_execute_permission_bit_for_regular_files=$execute_color;$dim:$the_user_execute_for_other_file_kinds=$execute_color;$dim:$the_group_execute_permission_bit=$execute_color;$dim:$the_others_execute_permission_bit=$execute_color;$dim:
    :$the_extended_attribute_indicator=$dim:
    
    # 
    # file sizes
    # 
        # small
        :$the_numbers_of_a_files_size_sets_nb_nk_nm_ng_and_nh=$small_files:$the_numbers_of_a_files_size_if_it_is_lower_than_1_kb_or_kib=$small_files:$the_numbers_of_a_files_size_if_it_is_between_1_kb_or_ki_b_and_1_mb_or_mi_b=$small_files:
        :$the_units_of_a_files_size_if_it_is_lower_than_1_kb_or_kib=$small_files:$the_units_of_a_files_size_if_it_is_between_1_kb_or_ki_b_and_1_mb_or_mi_b=$small_files:
        # medium
        :$the_numbers_of_a_files_size_if_it_is_between_1_mb_or_mi_b_and_1_gb_or_gi_b=$medium_files:
        :$the_units_of_a_files_size_if_it_is_between_1_mb_or_mi_b_and_1_gb_or_gi_b=$medium_files:
        # big
        :$the_numbers_of_a_files_size_if_it_is_between_1_gb_or_gi_b_and_1_tb_or_ti_b=$big_files:$the_numbers_of_a_files_size_if_it_is_1_tb_or_ti_b_or_higher=$big_files:
        :$the_units_of_a_files_size_if_it_is_between_1_gb_or_gi_b_and_1_tb_or_ti_b=$big_files:$the_units_of_a_files_size_if_it_is_1_tb_or_ti_b_or_higher=$big_files:
    
    # user
    :$a_user_thats_you=$user_group_color;$dim:$a_user_thats_someone_else=$user_group_color;$dim:$a_group_that_you_belong_to=$user_group_color;$dim:$a_group_you_arent_a_member_of=$user_and_group_color;$dim:
    
    # date
    :$a_files_date=$purple;$bold;$dim:
    "
}
__temp_set_exa_colors # done with a to () prevent large namespace pollution


ll () {
    # if exa is not available, start going with backup plans
    if ! command -v "exa" &> /dev/null
    then
        # if mac
        if [[ "$OSTYPE" == "darwin"* ]] 
        then
            # make use of BSD version
            if ! command -v "gls" &> /dev/null
            then
                ls -lAFG "$@"
            # if gnu-ls is available, use it
            else
                gls -lAF --group-directories-first --color "$@"
            fi
        # if not mac
        else
            ls -lAF --group-directories-first --color "$@"
        fi
    else
        # | tac # <- is for getting folders at the bottom
        exa --color=always -lF --sort extension --group-directories-first --git --all  "$@" | tac
    fi
}