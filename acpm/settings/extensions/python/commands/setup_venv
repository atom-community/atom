# TMPDIR fixes a pip issue
export TMPDIR="$HOME/tmp.cleanable"
mkdir -p "$TMPDIR"
export VIRTUAL_ENV="$FORNIX_FOLDER/.venv"
export PATH="$VIRTUAL_ENV/bin:$PATH"
if ! [ -d "$VIRTUAL_ENV" ]
then
    echo "creating virtual env for python"
    python -m venv "$VIRTUAL_ENV" && echo "virtual env created"
fi

# fix SSL issues
export SSL_CERT_FILE="$(python -c 'import ssl; print(ssl.get_default_verify_paths().openssl_cafile)')"  