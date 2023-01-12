import { MatrixAuth } from "matrix-bot-sdk";
import config from "./config";

(async function () {
  const auth = new MatrixAuth(config.bot.serverUrl);
  const client = await auth.passwordLogin(
    config.bot.username,
    config.bot.password,
    "BOT"
  );

  console.log(
    "Copy this access token to your bot's config: ",
    client.accessToken
  );
})();
