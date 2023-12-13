variable "CI_REGISTRY_IMAGE" {
    default = "registry.gitlab.syncad.com/hive/block_explorer_ui"
}
variable "CI_COMMIT_SHORT_SHA" {}
variable "CI_COMMIT_TAG" {}
variable "TAG" {
  default = "latest"
}

function "notempty" {
  params = [variable]
  result = notequal("", variable)
}

group "default" {
  targets = ["local-build"]
}

target "local-build" {
  dockerfile = "Dockerfile"
  tags = [
    "${CI_REGISTRY_IMAGE}:${TAG}",
    notempty(CI_COMMIT_SHORT_SHA) ? "${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHORT_SHA}": "",
    notempty(CI_COMMIT_TAG) ? "${CI_REGISTRY_IMAGE}:${CI_COMMIT_TAG}": ""
  ]
  output = [
    "type=docker"
  ]
}

target "ci-build" {
  inherits = ["local-build"]
  cache-from = [
    "type=registry,ref=${CI_REGISTRY_IMAGE}/cache:${TAG}"
  ]
  cache-to = [
    "type=registry,mode=max,image-manifest=true,ref=${CI_REGISTRY_IMAGE}/cache:${TAG}"
  ]
  output = [
    "type=registry"
  ]
}