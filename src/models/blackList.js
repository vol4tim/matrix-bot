import db from "./db";

const BlackList = db.sequelize.define("blackList", {
  userId: {
    type: db.Sequelize.STRING
  }
});

export default BlackList;
