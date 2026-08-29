import Action from './action.js'

class P2P{
    
  constructor(game, clock){
    this.game = game;
    this.clock = clock;
  }

  host(roomName) {

      console.log(roomName)

      this.peer = new Peer(roomName);

      this.peer.on("open", id => {
          console.log("Hosting:", id);

          this.peer.on("connection", conn => {
              this.conn = conn;

              console.log("Opponent connected.");
              this.setupConnection();
              this.game.setupOnlineGame(true);
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
              this.game.setupOnlineGame(false)
              this.send(new Action("readyForBoard", null))
          });

          this.conn.on("error", err => {
              console.log(err);
          });

      });

  }

  setupConnection() {

      this.conn.on("data", data => {
          if (data.type === "readyForBoard")this.game.sendBoardState()
          if (data.type === "move")this.game.receivePeerMove(data.action)
          if (data.type === "hand")this.game.receiveHandUpdate(data.action)
          if (data.type === "drag")this.game.receiveDragUpdate(data.action)
          if (data.type === "handshake")this.game.receiveHandShake()
          if (data.type === "clockSet")this.clock.receiveClockSet(data.action)
          if (data.type === "clockButtonPress")this.clock.receiveClockButtonPress(data.action)
          if (data.type === "boardState")this.game.receiveBoardState(data.action)
          if (data.type === "newGame")this.game.resetBoard(false)
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