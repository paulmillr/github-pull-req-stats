var path = './repos.json';

var data = require(path)
  .map(function(item) {
    var closed = item.closed;
    var merged = item.merged;
    delete item.closed;
    delete item.merged;
    item.closed = closed;
    item.merged = merged;
    return item;
  })
  .sort(function(a, b) {
    if (a.repo < b.repo) return -1;
    if (a.repo > b.repo) return 1;
    return 0;
  });

require('fs').writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
