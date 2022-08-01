import chat from "./chat";
import db from "./models/db";

db.sequelize.sync().then(() => {
  chat();
});
