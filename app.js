const COSNTS = {
  // 262144 bytes , channels[0].peer.sctp.maxMessageSize
  // 16775270 bufferedAmount problem

  // MAX_BYTES: 5,
  MAX_BYTES: 262124,
  UUID_LENGTH: 16,
  COUNTER_LENGTH: 4,
};

const ReceivingFiles = {};

function RTCFile(uuid, fileName, type, size, noOfPackets) {
  this.uuid = uuid;
  this.fileName = fileName;
  this.type = type;
  this.size = size;
  this.noOfPackets = noOfPackets;
  this.packets = new Array(noOfPackets);
  this.receivedPacket = 0;

  this.setPacket = (index, packet) => {
    this.packets[index] = new Uint8Array(packet);
    this.receivedPacket++;

    if (this.isComplete()) {
      console.log(this.uuid, this.fileName, "Completed");
      this.package();
    }
  };

  this.isComplete = () => {
    if (this.receivedPacket < this.noOfPackets) return false;
    return this.packets.every((p) => p);
  };

  this.merge = () => {
    const file = new Uint8Array(this.size);
    let offset = 0;
    this.packets.forEach((packet) => {
      file.set(packet, offset);
      offset += packet.byteLength;
    });

    return file;
  };

  this.package = () => {
    const mereged = this.merge();
    console.log("Merged", mereged);

    // const blob = new Blob(mereged, { type: this.type });
    // console.log("Merged file", blob);

    const url = URL.createObjectURL(
      new Blob([mereged.buffer], { type: this.type })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = this.fileName;
    link.click();

    window.URL.revokeObjectURL(url);
  };
}

function uploadFile() {
  const uploadFileEle = document.getElementById("fileInput");
  if (!uploadFileEle.files.length) return null;
  console.log(uploadFileEle.files[0]);
  return uploadFileEle.files[0];
}

async function sendUploadedFile(toUser) {
  const file = uploadFile();
  if (!file) {
    console.log("No File Found");
    return null;
  }

  const uuid = crypto.randomUUID();
  const meta = metaBuilder(uuid, file.name, file.type, file.size);

  const fileArrayBuffer = await file.arrayBuffer();
  sendFile(toUser, fileArrayBuffer, meta);
}

function sendDummyPacket(toUser) {
  const uuid = crypto.randomUUID();
  const meta = metaBuilder(uuid, "dummy", "gif", 21);
  sendFile(toUser, dummyPacket(), meta);
}

function sendFile(toUser, data, meta) {
  const packets = packetBuilder(data, meta);

  if (!packets.length) {
    console.log("No packets to send");
    return;
  }

  const index = channels.findIndex((p) => p.name == toUser);
  const peer = channels[index];

  console.log("Sending File", meta);
  peer.channel.send(JSON.stringify(meta));
  packets.forEach((packet) => {
    console.log("bufferedAmount", peer.channel.bufferedAmount);
    peer.channel.send(packet);
  });
}

function handleRTCMessage(message) {
  const { data } = message;

  console.log("Message Received", { data });

  switch (typeof data) {
    case "string":
      handleMetaDataReceived(data);
      break;
    case "object":
      handlePacketReceived(data);
      break;
  }
}

function handleMetaDataReceived(data) {
  const meta = JSON.parse(data);

  console.log("Meta Received", meta);

  const { uuid, name, size, type, noOfPackets } = meta;

  ReceivingFiles[uuid] = new RTCFile(uuid, name, type, size, noOfPackets);
}

function handlePacketReceived(packet) {
  console.log("Packet Received", packet);

  const { uuid, counter, slice } = packetParser(packet);
  console.log("handlePacketReceived", { uuid, counter, slice });

  ReceivingFiles[uuid].setPacket(counter, slice);
}

const dummyPacket = () => {
  return new Uint8Array([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  ]).buffer;
};
