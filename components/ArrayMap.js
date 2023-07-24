function ArrayMap(name) {
  this.name = name;
  this.list = [];
  this.map = new Map();
}

ArrayMap.prototype.push = function (file) {
  const index = this.list.length;
  this.map.set(file.uuid, index);
  this.list.push(file);
};
ArrayMap.prototype.get = function (uuid) {
  const index = this.map.get(uuid);
  if (index == undefined || index == null) {
    console.log(uuid, "get: not found in", this.name);
    return null;
  }
  return this.list[index];
};
ArrayMap.prototype.pop = function (uuid) {
  const index = this.map.get(uuid);
  if (index == undefined || index == null) {
    console.log(uuid, "pop: not found in", this.name);
    return false;
  }
  this.list.splice(index, 1);
  this.map.delete(uuid);
  return true;
};
ArrayMap.prototype.swap = function (a, b) {
  const temp = this.list[a];
  this.list[a] = this.list[b];
  this.list[b] = temp;

  this.map.set(this.list[a].uuid, a);
  this.map.set(this.list[b].uuid, b);
};
ArrayMap.prototype.reverse = function () {
  for (
    let i = 0, j = this.list.length - 1;
    i < (this.list.length - 1) / 2;
    i++, j--
  ) {
    this.swap(i, j);
  }
};
