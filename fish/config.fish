alias ff="fastfetch -c examples/11"

if status is-interactive
    export GPG_TTF=$(tty)
    # Commands to run in interactive sessions can go here
end
