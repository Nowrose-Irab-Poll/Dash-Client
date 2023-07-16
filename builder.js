const packetBuilder = (data, meta) => {
  const { uuid } = meta;
  const uuidBuffer = Util.uuidStringToArrayBuffer(uuid);

  const packets = [];
  let offset = 0;
  for (let i = 0; offset < data.byteLength; i++, offset += COSNTS.MAX_BYTES) {
    console.log(i);
    const packet = new Uint8Array(
      COSNTS.UUID_LENGTH +
        COSNTS.COUNTER_LENGTH +
        (data.byteLength - offset > COSNTS.MAX_BYTES
          ? COSNTS.MAX_BYTES
          : data.byteLength - offset)
    );
    const counter = new Uint32Array([i]);
    const slice = new Uint8Array(data.slice(offset, offset + COSNTS.MAX_BYTES));

    packet.set(uuidBuffer);
    packet.set(counter, COSNTS.UUID_LENGTH);
    packet.set(slice, COSNTS.COUNTER_LENGTH + COSNTS.UUID_LENGTH);
    packets.push(packet);
  }

  return packets;
};

const metaBuilder = (uuid, fileName, fileType, size) => {
  return {
    type: "meta",
    uuid,
    name: fileName,
    type: fileType,
    size,
    noOfPackets: Math.ceil(size / COSNTS.MAX_BYTES),
  };
};

const packetParser = (data) => {
  let offset = 0;
  const uuid = new Uint8Array(data.slice(offset, offset + COSNTS.UUID_LENGTH));
  offset += COSNTS.UUID_LENGTH;

  const counter = data.slice(offset, offset + COSNTS.COUNTER_LENGTH);
  offset += COSNTS.COUNTER_LENGTH;

  const slice = data.slice(offset);

  const uuidString = Util.uuidArrayBufferToString(uuid);
  const counterInt = new Uint32Array(counter);

  return { uuid: uuidString, counter: counterInt[0], slice };
};
