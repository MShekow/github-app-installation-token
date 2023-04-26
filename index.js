import { Octokit } from "octokit";
import {createAppAuth} from "@octokit/auth-app"
import {readFileSync} from "fs"
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'


async function printGitHubAppInstallationToken(api_url, app_id, private_key_path, app_installation_id) {
    const privateKey = readFileSync(private_key_path, "utf8");
    const appOctokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: app_id,
          privateKey: privateKey,
          // this will make appOctokit authenticate as app (JWT) or installation (access token), depending on the request URL
          installationId: app_installation_id,
        },
        baseUrl: api_url,
      });
      
      const { token } = await appOctokit.auth({
        type: "installation"
      });
      console.log(token);
};

const parser = yargs(hideBin(process.argv))
  .command(
    '* <app_id> <app_installation_id> <private_key_path> [api_url]', 'Retrieve a GitHup app installation token',
    (yargs) => {
      yargs
      .positional('app_id', {
        describe: 'ID of the application (as displayed on the GitHub app\'s detail page)',
        type: 'string',
      })
      .positional('app_installation_id', {
        describe: 'ID of the installation application into the repository or organization (as indicated by the number that is part of the URL of the installation page)',
        type: 'string',
      })
      .positional('private_key_path', {
        describe: 'Absolute path to the GitHub app\'s private key file',
        type: 'string',
      })
      .positional('api_url', {
        describe: 'GitHub API URL, only needs to be specified for GitHub Enterprise servers - e.g. https://ghe.my-company.com/api/v3',
        type: 'string',
        default: "https://api.github.com"
      })
    },
    async (argv) => {
      await printGitHubAppInstallationToken(argv.api_url, argv.app_id, argv.private_key_path, argv.app_installation_id)
    }
  )
  .fail(false)
try {
  const argv = await parser.parse();
} catch (err) {
  console.error(err);
  process.exit(1);
}
