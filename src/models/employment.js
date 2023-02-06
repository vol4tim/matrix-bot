import db from "./db";

const Employment = db.sequelize.define("employment", {
  userId: {
    type: db.Sequelize.INTEGER
  },
  userIdRoot: {
    type: db.Sequelize.INTEGER
  },
  employment: {
    type: db.Sequelize.NUMBER,
    default: 0
  }
});

export default Employment;
