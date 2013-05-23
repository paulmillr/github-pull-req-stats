var range = require('range.js');
var when = require('when');
var cheerio = require('cheerio');
var load = require('./load');

var getUrl = function(repo, page) {
  if (page == null) page = 1;
  return 'https://github.com/' + repo + '/pulls?direction=desc&page=' + page + '&sort=created&state=closed';
};

var getPrUrl = function(repo, number) {
  return 'https://github.com/' + repo + '/pull/' + number;
};

var counter = function(list) {
  return list.reduce(function(statuses, status) {
    if (!statuses[status]) statuses[status] = 0;
    // statuses.total += 1;
    statuses[status] += 1;
    return statuses;
  }, {closed: 0, merged: 0});
};

var getIssues = function(body) {
  var $ = cheerio.load(body);
  return $('.list-group-item-number').toArray()
    .map(function(_) {return $(_).text();})
    .map(function(_) {return parseInt(_.replace('#', ''), 10)});
};

var processPage = function(body) {
  var $ = cheerio.load(body);
  return $('.discussion-sidebar .state-indicator').text().trim().toLowerCase();
};

var processRepo = function(repo) {
  return load(getUrl(repo, 1))
    .then(function(body) {
      var $ = cheerio.load(body);
      var pages = $('.issues-list-options .pagination > a').toArray()
        .map(function(_) {return parseInt($(_).text());})
        .filter(function(_) {return _;});
      var lastPage = Math.max.apply(Math, pages);
      if (lastPage === -Infinity) throw new Error('No pages');
      // console.log('Last page is', lastPage);
      var urls = range(1, lastPage).map(getUrl.bind(null, repo));
      return when.all(urls.map(load));
    })
    .then(function(bodies) {
      var issues = [].concat.apply([], bodies.map(getIssues));
      var urls = issues.map(getPrUrl.bind(null, repo));
      console.log('Loading', urls.length, 'pull requests for', repo);
      return when.all(urls.map(load));
    })
    .then(function(bodies) {
      var statuses = bodies.map(processPage);
      var stats = counter(statuses);
      var percentage = (stats.merged / stats.total * 100).toFixed(2) + '%';
      return stats;
    }, console.error.bind(console));
};

var saveData = function() {
  fs.writeFileSync('./repos.json')
}

// var data = require('./repos');
var data = [{repo: 'paulmillr/es6-shim'}];

var promises = data
  .map(function(item, index) {
    return processRepo(item.repo)
      .then(function(stats) {
        return 'Stats for ' + data[index].repo + ' ' + JSON.stringify(stats);
      });
  });

when.all(promises).then(function(stats) {
  console.log(stats);
});
