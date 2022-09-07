import db from "./db";

const User = db.sequelize.define("user", {
  roomId: {
    type: db.Sequelize.STRING
  },
  userId: {
    type: db.Sequelize.STRING,
    unique: true
  },
  addressParachain: {
    type: db.Sequelize.STRING
  },
  addressEthereum: {
    type: db.Sequelize.STRING
  }
});

export default User;
