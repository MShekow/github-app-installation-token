//const { Octokit } = require("octokit");
//const { createAppAuth } = require("@octokit/auth-app");
import { Octokit } from "octokit";
import {createAppAuth} from "@octokit/auth-app"
import {readFileSync} from "fs"


(async () => {
    const privateKey = readFileSync("./private-key.txt", "utf8");
    const appOctokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: 322780,
          privateKey: privateKey,
          // this will make appOctokit authenticate as app (JWT) or installation (access token), depending on the request URL
          installationId: 36777409,
        },
      });
      
      //const { data } = await appOctokit.request("/app");
      
      // The .auth() method returned by the current authentication strategy can be accessed at octokit.auth(). Example
      
      const { token } = await appOctokit.auth({
        type: "installation"
      });
      console.log(token);
})();

