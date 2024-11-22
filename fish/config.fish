alias ff="fastfetch -c examples/11"
alias setproxy="export http_proxy=http://127.0.0.1:7890/; export https_proxy=http://127.0.0.1:7890/; echo 'Set proxy successfully'"
alias unsetproxy="unset http_proxy; unset https_proxy; echo 'Unset proxy successfully'"

if status is-interactive
    # Commands to run in interactive sessions can go here
end
