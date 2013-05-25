var when = require('when');
var request = require('superagent');

var total = 0;

var load = function(url) {
  var deferred = when.defer();

  var rejectWith = function(error) {
    return deferred.reject(new Error('URL "' + url + '" failed: ' + error));
  };

  // console.log('Loading url', url);
  request.get(url, function(error, response) {
    total += 1;
    if (total % 10 === 0) console.log('Processed:', total);
    if (error) return rejectWith(error);
    if (response.error) return rejectWith(response.error);
    deferred.resolve(response.text);
  });
  return deferred.promise;
};

module.exports = load;
