import net from "net";

export class IpcClient {
  constructor(port) {
    this.cbs = {};
    this.socket = new net.Socket();
    this.socket.connect({ port: port }, () => {
      this.socket.on("data", (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.topic && message.data && this.cbs[message.topic]) {
            this.cbs[message.topic](message.data);
          }
        } catch (error) {
          console.log(error);
        }
      });
    });

    this.socket.on("error", function (e) {
      console.log("e", e);
    });
    this.socket.on("close", () => {
      console.log("close");
    });
  }
  send(topic, data) {
    return this.socket.write(
      JSON.stringify({
        topic,
        data
      })
    );
  }
  on(topic, cb) {
    this.cbs[topic] = cb;
  }
  destroy() {
    this.socket.destroy();
  }
}
