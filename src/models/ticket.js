import db from "./db";

const Ticket = db.sequelize.define("ticket", {
  userId: {
    type: db.Sequelize.INTEGER
  },
  chain: {
    type: db.Sequelize.INTEGER
  },
  status: {
    type: db.Sequelize.INTEGER,
    default: 1
  },
  date: {
    type: db.Sequelize.INTEGER
  },
  course: {
    type: db.Sequelize.NUMBER,
    default: 0
  },
  months: {
    type: db.Sequelize.NUMBER,
    default: 0
  },
  koef: {
    type: db.Sequelize.NUMBER,
    default: 0
  },
  amount: {
    type: db.Sequelize.STRING
  },
  tx: {
    type: db.Sequelize.STRING
  }
});

export const chains = {
  ETH: 1,
  ROB: 2
};
export const status = {
  NEW: 1,
  CALC: 2,
  PROCCESS: 3,
  SUCCESS: 4,
  FAIL: 5
};

export default Ticket;
