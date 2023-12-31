#! /bin/bash

set -e

print_help () {
    cat <<-EOF
Usage: $0 <source directory> [OPTION[=VALUE]]...

Build a HAF Block Explorer Docker image
by default tagged as 'registry.gitlab.syncad.com/hive/block_explorer_ui:latest'
OPTIONS:
  --registry=URL        Docker registry to assign the image to (default: 'registry.gitlab.syncad.com/hive/block_explorer_ui')
  --tag=TAG             Docker tag to be build (default: 'latest')
  --progress=TYPE       Determines how to display build progress (default: 'auto')
  --help|-h|-?          Display this help screen and exit
EOF
}

export CI_REGISTRY_IMAGE=${CI_REGISTRY_IMAGE:-"registry.gitlab.syncad.com/hive/block_explorer_ui"}
export TAG=${TAG:-"latest"}
PROGRESS_DISPLAY=${PROGRESS_DISPLAY:-"auto"}

while [ $# -gt 0 ]; do
  case "$1" in
    --registry=*)
        arg="${1#*=}"
        export CI_REGISTRY_IMAGE="$arg"
        ;;
    --tag=*)
        arg="${1#*=}"
        export TAG="$arg"
        ;;
    --progress=*)
        arg="${1#*=}"
        PROGRESS_DISPLAY="$arg"
        ;;
    --help|-h|-?)
        print_help
        exit 0
        ;;
    *)
        if [ -z "$SRCROOTDIR" ];
        then
          SRCROOTDIR="${1}"
        else
          echo "ERROR: '$1' is not a valid option/positional argument"
          echo
          print_help
          exit 2
        fi
        ;;
    esac
    shift
done

TARGET="local-build"
if [ -n "${CI:-}" ];
then
    TARGET="ci-build"
fi

pushd "$SRCROOTDIR"

docker buildx bake --provenance=false --progress="$PROGRESS_DISPLAY" "$TARGET"

popd