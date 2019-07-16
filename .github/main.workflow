workflow "Push" {
  on = "push"
  resolves = ["Deployment"]
}

action "Installation" {
  needs = "Filters for GitHub Actions"
  uses = "thonatos/github-actions-nodejs@v0.1.0"
  args = "yarn"
}

action "CI" {
  needs = "Installation"
  uses = "thonatos/github-actions-nodejs@v0.1.0"
  args = "yarn ci"
}

action "Deployment" {
  needs = "CI"
  uses = "thonatos/github-actions-nodejs@v0.1.0"
  args = "yarn semantic-release "
  secrets = ["GITHUB_TOKEN", "NPM_TOKEN"]
}

# Filter for master branch
action "Filters for GitHub Actions" {
  uses = "actions/bin/filter@3c0b4f0e63ea54ea5df2914b4fabf383368cd0da"
  secrets = ["GITHUB_TOKEN"]
  args = "branch master"
}