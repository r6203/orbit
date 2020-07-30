import socketIO from "socket.io-client";

const io = socketIO();

const interval = setInterval(() => {
  if (io.connected) {
    clearInterval(interval);

    return;
  }

  console.log(`Retrying to connect to HMR server`);

  io.connect();
}, 1000);

io.on("connect", () => {
  console.log(`Connected to HMR server`);
});

io.on("site_change", () => {
  console.log("site changed");

  location.reload();
});
