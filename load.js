var fs = require('fs');
var range = require('range.js');
var when = require('when');
var cheerio = require('cheerio');
var load = require('./load-url');

var getUrl = function(repo, page) {
  if (page == null) page = 1;
  return 'https://github.com/' + repo + '/pulls?direction=desc&page=' + page + '&sort=created&state=closed';
};

var getPrUrl = function(repo, number) {
  return 'https://github.com/' + repo + '/pull/' + number;
};

var saveData = function(repos) {
  fs.writeFileSync('./repos.json', JSON.stringify(repos, null, 2));
};

var counter = function(list) {
  return list.reduce(function(statuses, status) {
    if (!statuses[status]) statuses[status] = 0;
    statuses[status] += 1;
    return statuses;
  }, {closed: 0, merged: 0});
};

var getIssues = function(body) {
  var $ = cheerio.load(body);
  return $('.list-group-item-number').toArray()
    .map(function(_) {return $(_).text();})
    .map(function(_) {return parseInt(_.replace('#', ''), 10);});
};

var processPage = function(body) {
  var $ = cheerio.load(body);
  return $('.discussion-sidebar .state-indicator').text().trim().toLowerCase();
};

var processItem = function(item) {
  var repo = item.repo;
  return load(getUrl(repo, 1))
    .then(function(body) {
      // Select element that contains pagination and extract pages.
      var $ = cheerio.load(body);
      var pages = $('.issues-list-options .pagination > a').toArray()
        .map(function(_) {return parseInt($(_).text());})
        .filter(function(_) {return _;});
      var lastPage = Math.max.apply(Math, pages);
      console.log('Loading', repo);

      // TODO: fix for 1 page.
      if (lastPage === -Infinity) throw new Error('No pages');

      var urls = range(1, lastPage).map(getUrl.bind(null, repo));
      return when.all(urls.map(load));
    })
    .then(function(bodies) {
      // Load all pull request URLs.
      var issues = [].concat.apply([], bodies.map(getIssues));
      var urls = issues.map(getPrUrl.bind(null, repo));
      console.log('Loading', urls.length, 'pull requests for', repo);
      return when.all(urls.map(load));
    })
    .then(function(bodies) {
      // Generate stats for all bodies, save it on item (mutate).
      var statuses = bodies.map(processPage);
      var stats = counter(statuses);
      item.closed = stats.closed;
      item.merged = stats.merged;
      return item;
    }, console.error.bind(console));
};

// Warning: repos will be mutated!
var processItems = function(repos) {
  repos
    .filter(function(_) {return !_.closed && !_.merged;})
    .forEach(function(item) {
      return processItem(item)
        .then(function(item) {
          console.log(item.repo, 'is finished — saving data');
          saveData(repos);
          return item;
        });
    });
};

processItems(require('./repos.json'));
