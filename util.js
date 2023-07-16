const Util = {
  uuidStringToArrayBuffer: (str) => {
    const buffer = new Uint8Array(16);
    const chunks = str.split("-");
    let index = 0;

    chunks.forEach((element) => {
      for (let i = 0; i < element.length; i += 2) {
        buffer[index] = parseInt(element.slice(i, i + 2), 16);
        index++;
      }
    });

    return buffer;
  },
  uuidArrayBufferToString: (buffer) => {
    const markers = [4, 2, 2, 2, 6];
    const chunks = [];
    const temp = [];

    for (let i = 0, start = 0; i < markers.length; i++) {
      for (let j = start; j < start + markers[i]; j++) {
        temp.push(("0" + (buffer[j] & 0xff).toString(16)).slice(-2));
      }
      chunks.push(temp.join(""));
      temp.length = 0;
      start += markers[i];
    }

    return chunks.join("-");
  },
};
