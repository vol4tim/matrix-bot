import fs from "fs";
import path from "path";

const db = {
  read() {
    try {
      return JSON.parse(
        fs.readFileSync(path.resolve(__dirname, "../files/db.txt"))
      );
    } catch (error) {
      console.log(error);
      return { data: null, time: null };
    }
  },
  write(data) {
    fs.writeFileSync(
      path.resolve(__dirname, "../files/db.txt"),
      JSON.stringify({
        data,
        time: Date.now()
      })
    );
  },
  getUsers() {
    const result = this.read();
    return result.data.users;
  },
  getUser(roomId) {
    const result = this.read();
    return result.data.users.find((item) => {
      return item.roomId === roomId;
    });
  },
  addUser(user) {
    const result = this.read();
    result.data.users.push(user);
    this.write(result.data);
  },
  updateUser(roomId, data) {
    const result = this.read();
    const index = result.data.users.findIndex((item) => {
      return item.roomId === roomId;
    });
    if (index < 0) {
      throw new Error("пользователь не найден");
    } else {
      result.data.users[index] = {
        ...result.data.users[index],
        ...data
      };
      this.write(result.data);
    }
  }
};

export default db;
