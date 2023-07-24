const UiHandler = {
  userInfo: "user-info",
  userName: "user-name",
  userId: "user-id",
  qrCode: "qr-code",
  qrCodeCont: null,
  qrDownload: "qr-download",
  setUserInfo: function (userName, userId) {
    if (userId) this.setUserId(userId);
    if (userName) this.setUserName(userName);
  },
  setUserName: function (userName) {
    const userNameCont = document.querySelector(`#${this.userName}`);
    userNameCont.innerText = userName;
  },
  setUserId: function (userId) {
    const userIdCont = document.querySelector(`#${this.userId}`);
    userIdCont.innerText = userId;
    this.setQRCode(userId);
  },
  setQRCode: function (qrCode) {
    if (!this.qrCodeCont) {
      this.qrCodeCont = new QRCode(`${this.qrCode}`, {
        text: qrCode,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    } else this.qrCodeCont.makeCode(qrCode);
  },
  onClickQRDownload: function () {
    if (!this.qrCodeCont) return;

    const qrCont = document.querySelector(`#${this.qrCode}`);

    const imgTag = qrCont.querySelector("img");
    const link = document.createElement("a");
    link.href = imgTag.src;
    link.download = "Dash-QR";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

document
  .querySelector(`#${UiHandler.qrDownload}`)
  .addEventListener("click", () => {
    UiHandler.onClickQRDownload();
  });
