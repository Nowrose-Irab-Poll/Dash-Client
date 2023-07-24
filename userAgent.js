const UserAgent = {
  uid: null,
  userName: null,
  hostedFiles: new ArrayMap("HostedFiles"),

  getUid: function () {
    return this.uid;
  },
  setUid: function (uid) {
    this.uid = uid;
    UiHandler.setUserId(uid);
  },
  getUserName: function () {
    return this.username;
  },
  setUserName: function (userName) {
    this.userName = userName;
    UiHandler.setUserName(userName);
  },
};
