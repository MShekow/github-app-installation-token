# github-app-installation-token

This is a dockerized CLI tool that retrieves a [GitHub App installation access token](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app), given the App's ID and private key.

It was developed to be used in CI/CD platforms _other than_ **GitHub Actions**, e.g. **Azure DevOps** or **Circle CI**, that need to interact with GitHub.com (or some GitHub Enterprise server) where your code is stored.

Example use cases:

- Authenticating Renovate Bot (as described in its [documentation](https://docs.renovatebot.com/modules/platform/github/#running-as-a-github-app)) against a self-hosted GitHub _Enterprise_ instance
  - Note: if you were using the `github.com` service, you could just use the [official Renovate Bot GitHub app](https://docs.renovatebot.com/getting-started/installing-onboarding/#hosted-githubcom-app)
- Authenticating Infrastructure-as-Code tools (such as Terraform or Ansible) so that they can, say, download Terraform _modules_ (or Ansible _roles_) stored on GitHub, without using a Personal Access Token, or to allow Terraform to provision GitHub repositories (e.g. [`github_repository`](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/repository))

## Usage

On a **Linux**-based CI/CD runner, run the following in a shell. The GitHub app installation token will be printed to `stdout` (exit code `0`). In case something went wrong, the exit code is `1` and the error details are printed to the console.

`docker run --rm -v "$PWD/path/to/private-key.txt:/private-key.txt" ghcr.io/mshekow/github-app-installation-token:latest <app ID> <app installation ID> /private-key.txt <optional GitHub Enterprise API URL>`

Run `docker run --rm ghcr.io/mshekow/github-app-installation-token:latest` to get help for the arguments.

The `ghcr.io/mshekow/github-app-installation-token` Docker image is built for Intel/AMD 64-bit and ARM 64-bit architectures. Just open a Pull Request if you need additional CPU architectures. It is automatically rebuilt whenever there are dependency updates

## Alternatives

If you use **GitHub Actions** you can use https://github.com/jnwng/github-app-installation-token-action or https://github.com/tibdex/github-app-token.

If you are looking for a _Docker-based_ alternative, define a (Docker) _container-based_ job in your CI/CD pipeline, that starts a Node.js-based image. Use https://github.com/gagoar/github-app-installation-token to install a Node-based CLI tool that can retrieve GitHub App installation access tokens. At the time of writing this README, however, that repository seemed to lack maintenance, which is why I created this tool.

## Example for Azure DevOps Pipelines and Renovate Bot

The following `azure-pipeline.yaml` snippet demonstrates how to retrieve the GitHub App installation access token, to be consumed by Renovate Bot (see its [documentation](https://docs.renovatebot.com/modules/platform/github/#running-as-a-github-app)). We assume that you use Azure KeyVault to _securely_ store your GitHub App's private key and the GitHub **.com** token (used by Renovate to work around GitHub API limits when fetching release data).

```yaml
jobs:
 - job: run_renovate_bot
   displayName: Run Renovate Bot
   variables:  # Replace the concrete values with yours
     githubAppId: 123
     githubAppInstallationId: 456
     githubServerUrl: https://your.github.enterprise.instance.url/api/v3
   steps:
     - task: AzureKeyVault@2
       inputs:  # Replace the concrete values with yours
         azureSubscription: 'Your-Azure-Subscription'
         KeyVaultName: 'Your-Key-Vault-Name'
         SecretsFilter: '*'
         RunAsPreJob: true
     # "renovateGitHubAppPrivateKey" is the name of the secret in your KeyVault which the
     # "AzureKeyVault@2" task has made available as Azure DevOps variable $(renovateGitHubAppPrivateKey)
     - script: |
         set -euxo pipefail
         cat <<EndOfFile >> priv-key.txt
         $(renovateGitHubAppPrivateKey)
         EndOfFile
       displayName: download GitHub app private key
     - script: |-
         set -euo pipefail
         APP_INSTALLATION_TOKEN=$(
           {
             docker run --rm -v "$PWD/priv-key.txt:/private-key.txt" \
               ghcr.io/mshekow/github-app-installation-token:latest \
               $(githubAppId) $(githubAppInstallationId) /private-key.txt $(githubServerUrl)
           }
         )
         echo "##vso[task.setvariable variable=appInstallationToken;issecret=true]$APP_INSTALLATION_TOKEN"
       displayName: Get GitHub app installation access token
     - script: |-
         set -euo pipefail
         export RENOVATE_TOKEN='$(appInstallationToken)'
         docker run --rm -v "$PWD/config.js:/usr/src/app/config.js" -e RENOVATE_TOKEN -e GITHUB_COM_TOKEN -e LOG_LEVEL renovate/renovate
       env:
         GITHUB_COM_TOKEN: $(githubComPat)  # Replace with the name of they KeyVault secret that stores your GitHub.com PAT
         LOG_LEVEL: "debug"  # By default, Renovate Bot only prints INFO-level statements
       displayName: Run Renovate Bot
```

The `RENOVATE_TOKEN` environment variable ensures that Renovate uses the provided GitHub App installation access token (it is equivalent to setting the `token` explicitly in `config.js`).
