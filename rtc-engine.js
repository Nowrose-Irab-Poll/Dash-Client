const peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:172.104.36.223", credential: "mango", username: "rotten" },
  ],
};
// var peer = new RTCPeerConnection(peerConnectionConfig);

var me;
const channels = [];

// var ws = new WebSocket("ws://127.0.0.1:8080");
var ws = new WebSocket("wss://dash-server-zav5.onrender.com");
ws.onopen = (e) => console.log("websocket opened", e);
ws.onclose = (e) => console.log("websocket closed");
ws.onmessage = (e) => {
  console.log("websocket message", e.data);
  var data = JSON.parse(e.data);
  // console.log("received nessage type : ", data.action);
  console.log("received nessage body : ", data);

  if (data.type == "connection-open") {
    handleUID(data);
  } else if (data.to === me) {
    switch (data.action) {
      case "candidate":
        console.log("received candidate in client 7", JSON.stringify(data));
        const candidateFrom = data.from;
        const tIndex = channels.findIndex((el) => el.name == candidateFrom);
        console.log("DEBUG candidateFrom", tIndex, data);

        channels[tIndex].peer
          .addIceCandidate(new RTCIceCandidate(data.data))
          .then(() => console.log("added ice candidate"))
          .catch((e) => console.log("add ice error", e));
        break;
      case "offer":
        console.log("received offer", data);

        const newPeer = new PeerChannel(data.from);
        newPeer.peer
          .setRemoteDescription(new RTCSessionDescription(data.data))
          .then(() => newPeer.peer.createAnswer())
          .then((sdp) => {
            ws.send(
              JSON.stringify({
                action: "answer",
                to: data.from,
                data: sdp,
                from: me,
              })
            );
            newPeer.peer.setLocalDescription(sdp);
          })
          .then(() => console.log("offer handled"))
          .catch((e) => console.log("error handling offer", e));

        channels.push(newPeer);
        break;
      case "answer":
        console.log("received answer in client 7 ", JSON.stringify(data));
        const { from, to } = data;

        const targetIndex = channels.findIndex((el) => el.name == from);
        console.log("DEBUG", targetIndex, data);

        channels[targetIndex].peer
          .setRemoteDescription(new RTCSessionDescription(data.data))
          .then(() => console.log("answer handled"))
          .catch((e) => console.log("error handling answer", e));
        break;
    }
  } else {
    console.log("NO ACTION REQUIRED");
  }
};

function PeerChannel(name) {
  this.name = name;
  this.peer = new RTCPeerConnection(peerConnectionConfig);
  this.channel = this.peer.createDataChannel("hello");
  _this = this;

  this.peer.ondatachannel = function (e) {
    console.log("ondatachannel: ", e);
    console.log("data channel : ", e.channel);
    this.channel = e.channel;
    this.channel.onopen = (e) => console.log("channel opened", e);
    this.channel.onclose = (e) => console.log("channel closed", e);
    this.channel.onmessage = (e) => {
      console.log("got message", { from: _this.name, e });
      handleRTCMessage(e);
    };
    this.channel.onerror = (e) =>
      console.log("error creating data channel ", e);
  };
  this.peer.onicecandidate = function (e) {
    console.log("onicecandidate", e);
    if (!e.candidate) return;
    console.log("got ice candidate", e);
    ws.send(
      JSON.stringify({
        action: "candidate",
        to: _this.name,
        data: e.candidate,
        from: me,
      })
    );
  };
}

function startGroup(members) {
  members.forEach((member) => {
    const newPeer = new PeerChannel(member);
    const pos = channels.length;
    channels.push(newPeer);

    channels[pos].peer
      .createOffer()
      .then((sdp) => {
        channels[pos].peer.setLocalDescription(sdp);
        const dataToSend = {
          action: "offer",
          to: channels[pos].name,
          data: sdp,
          from: me,
        };
        console.log("Sending offer to server : ", JSON.stringify(dataToSend));
        ws.send(JSON.stringify(dataToSend));
      })
      .catch((e) => console.log("error creating and sending offer", e));
  });
}

function startConnection(member) {
  const newPeer = new PeerChannel(member);
  const pos = channels.length;
  channels.push(newPeer);

  channels[pos].peer
    .createOffer()
    .then((sdp) => {
      channels[pos].peer.setLocalDescription(sdp);
      const dataToSend = {
        action: "offer",
        to: channels[pos].name,
        data: sdp,
        from: me,
      };
      console.log("Sending offer to server : ", JSON.stringify(dataToSend));
      ws.send(JSON.stringify(dataToSend));
    })
    .catch((e) => console.log("error creating and sending offer", e));
}

function handleUID(data) {
  console.log("Setting UID", data.uid);
  me = data.uid;
}
