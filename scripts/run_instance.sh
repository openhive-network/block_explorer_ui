#! /bin/bash

set -e

print_help () {
    cat <<-EOF
Usage: $0 [OPTION[=VALUE]]...

Run a Block Explorer UI Docker instance
OPTIONS:
  --image=IMAGE                 Docker image to run (default: 'registry.gitlab.syncad.com/hive/block_explorer_ui:latest')
  --api-endpoint=URL            API endpoint to be used by the new instance (default: 'https://api.hive.blog')
  --hive-blog-api-endpoint=URL  Hive Blog API endpoint to be used by the new instance (default: 'https://api.hive.blog')
  --port=PORT                   Port to be exposed (default: 5000)
  --name=NAME                   Container name to be used (default: block_explorer_ui)
  --detach                      Run in detached mode
  --help|-h|-?                  Display this help screen and exit
EOF
}

IMAGE=${IMAGE:-"registry.gitlab.syncad.com/hive/block_explorer_ui:latest"}
PORT=${PORT:-"5000"}
API_ENDPOINT=${API_ENDPOINT:-"https://api.hive.blog"}
HIVE_BLOG_API_ENDPOINT=${HIVE_BLOG_API_ENDPOINT:-"https://api.hive.blog"}
CONTAINER_NAME=${CONTAINER_NAME:-"block_explorer_ui"}
DETACH=${DETACH:-false}

while [ $# -gt 0 ]; do
  case "$1" in
    --image=*)
        arg="${1#*=}"
        IMAGE="$arg"
        ;;
    --api-endpoint=*)
        arg="${1#*=}"
        API_ENDPOINT="$arg"
        ;;
    --hive-blog-api-endpoint=*)
        arg="${1#*=}"
        HIVE_BLOG_API_ENDPOINT="$arg"
        ;;
    --port=*)
        arg="${1#*=}"
        PORT="$arg"
        ;;
    --name=*)
        arg="${1#*=}"
        CONTAINER_NAME="$arg"
        ;;
    --detach)
        DETACH=true
        ;;
    --help|-h|-?)
        print_help
        exit 0
        ;;
    *)
        echo "ERROR: '$1' is not a valid option/positional argument"
        echo
        print_help
        exit 2
        ;;
    esac
    shift
done

(docker ps -q --filter "name=$CONTAINER_NAME" | grep -q . && docker stop "$CONTAINER_NAME") || true

RUN_OPTIONS=(
    "--rm"
    "--publish" "$PORT:$PORT"
    "--env" "PORT=$PORT"
    "--env" "REACT_APP_API_ADDRESS=$API_ENDPOINT"
    "--env" "REACT_APP_HIVE_BLOG_API_ADDRESS=$HIVE_BLOG_API_ENDPOINT"
    "--name" "$CONTAINER_NAME"
)

if [[ "$DETACH" == "true" ]]; then
    RUN_OPTIONS+=("--detach")
fi

docker run "${RUN_OPTIONS[@]}" "$IMAGE"
