class P2P{
  constructor(game){
    this.game = game;
  }

  host(roomName) {

      this.peer = new Peer(roomName);

      this.peer.on("open", id => {
          console.log("Hosting:", id);

          this.peer.on("connection", conn => {
              this.conn = conn;

              console.log("Opponent connected.");

              this.setupConnection();
          });
          return true;
      });

      this.peer.on("error", err => {
          console.log(err.type);

          if (err.type === "unavailable-id")
              console.log("Room name already taken.");

          else
              console.log(err);

          return false;
      });

  }

  join(roomName) {

      this.peer = new Peer();

      this.peer.on("open", () => {

          this.conn = this.peer.connect(roomName);

          this.conn.on("open", () => {
              console.log("Connected!");
              this.setupConnection();
          });

          this.conn.on("error", err => {
              console.log(err);
          });

      });

  }

  setupConnection() {

      this.conn.on("data", data => {

          console.log("Received:", data);

          this.game.executeLiveMove(data)
      });

      this.conn.on("close", () => {
          console.log("Disconnected.");
      });

  }

  send(data) {

    if (this.conn?.open)
        this.conn.send(data);

  }
}

export default P2P;