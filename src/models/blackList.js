import db from "./db";

const BlackList = db.sequelize.define("blackList", {
  userId: {
    type: db.Sequelize.INTEGER
  }
});

export default BlackList;
