import net from "net";

export class IpcServer {
  constructor(port) {
    this.cbs = {};
    this.server = net.createServer((socket) => {
      socket.on("data", (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.topic && message.data && this.cbs[message.topic]) {
            this.cbs[message.topic](
              message.data,
              (replyData, topic) => {
                this.send(socket, topic || message.topic, replyData);
              },
              socket
            );
          }
        } catch (error) {
          console.log(error);
        }
      });
    });
    this.server.listen(port);
  }
  send(socket, topic, data) {
    return socket.write(
      JSON.stringify({
        topic,
        data
      })
    );
  }
  on(topic, cb) {
    this.cbs[topic] = cb;
  }
}
