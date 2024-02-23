variable "CI_REGISTRY_IMAGE" {
    default = "registry.gitlab.syncad.com/hive/block_explorer_ui"
}
variable "CI_COMMIT_SHORT_SHA" {}
variable "CI_COMMIT_TAG" {}
variable "TAG" {
  default = "latest"
}
variable "BUILD_TIME" {}
variable "GIT_COMMIT_SHA" {}
variable "GIT_CURRENT_BRANCH" {}
variable "GIT_LAST_LOG_MESSAGE" {}
variable "GIT_LAST_COMMITTER" {}
variable "GIT_LAST_COMMIT_DATE" {}

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
  args = {
    BUILD_TIME = "${BUILD_TIME}",
    GIT_COMMIT_SHA = "${GIT_COMMIT_SHA}",
    GIT_CURRENT_BRANCH = "${GIT_CURRENT_BRANCH}",
    GIT_LAST_LOG_MESSAGE = "${GIT_LAST_LOG_MESSAGE}",
    GIT_LAST_COMMITTER = "${GIT_LAST_COMMITTER}",
    GIT_LAST_COMMIT_DATE = "${GIT_LAST_COMMIT_DATE}",
  }
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