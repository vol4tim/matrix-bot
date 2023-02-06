import BlackList from "./blackList";
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

export async function getUsers() {
  User.hasOne(BlackList, {
    foreignKey: "userId",
    sourceKey: "userId",
    as: "black"
  });
  BlackList.belongsTo(User);
  const result = await User.findAll({
    include: {
      model: BlackList,
      as: "black"
    },
    where: {
      "$black.id$": null,
      id: 2
    },
    raw: true
  });
  return result;
}

export default User;
