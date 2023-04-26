# github-app-installation-token

This is a dockerized CLI tool that retrieves a [GitHub App installation access token](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app), given the App's ID and private key.

It was developed to be used in CI/CD platforms _other than_ **GitHub Actions**, e.g. **Azure DevOps** or **Circle CI**, that need to interact with GitHub.com (or some GitHub Enterprise server) where your code is stored.

## Usage

On a **Linux**-based CI/CD runner, run the following in a shell. The GitHub app installation token will be printed to `stdout` (exit code `0`). In case something went wrong, the exit code is `1` and the error details are be printed to the console.

`docker run --rm -v "$PWD/path/to/private-key.txt:/private-key.txt" ghcr.io/mshekow/github-app-installation-token: <app ID> <app installation ID> /private-key.txt <optional GitHub Enterprise API URL>`

Run `docker run --rm ghcr.io/mshekow/github-app-installation-token:latest` to get help for the arguments.

## Alternatives

If you use **GitHub Actions** you can use https://github.com/jnwng/github-app-installation-token-action or https://github.com/tibdex/github-app-token.

If you are looking for a _Docker-based_ alternative, define a (Docker) _container-based_ job in your CI/CD pipeline, that starts a Node.js-based image. Use https://github.com/gagoar/github-app-installation-token to install a Node-based CLI tool that can retrieve App installation access tokens. At the time of writing this README, however, that repository seemed to lack maintenance, which is why I created this tool.
