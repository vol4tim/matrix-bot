import db from "./db";
import BlackList from "./blackList";

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

export async function getUsers() {
  User.hasMany(BlackList, { primaryKey: "id" });
  BlackList.belongsTo(User, { foreignKey: "userId" });
  const result = await User.findAll({
    include: {
      model: BlackList
    },
    where: {
      "$blackLists.id$": null
    },
    raw: true
  });
  return result;
}

export default User;
