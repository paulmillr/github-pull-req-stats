var path = './repos.json';

// Uncomment when converting from tags:
// .map(function(item) {
//   var languages = ["c", "c++", "c#", "coffeescript", "haskell", "java", "javascript", "objective-c", "perl", "php", "python", "ruby", "scala"];
//   var language = item.tags.filter(function(_) {
//     return languages.indexOf(_) !== -1;
//   })[0];
//   if (language) {
//     var index = item.tags.indexOf(language);
//     item.tags.splice(index, 1);
//     item.language = language;
//   }
//   return item;
// })

var data = require(path)
  .map(function(item) {
    return {
      repo: item.repo, language: item.language,
      closed: item.closed, merged: item.merged, tags: item.tags
    };
  })
  .sort(function(a, b) {
    if (a.repo < b.repo) return -1;
    if (a.repo > b.repo) return 1;
    return 0;
  });

require('fs').writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
