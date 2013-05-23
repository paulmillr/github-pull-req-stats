var when = require('when');
var request = require('superagent');

// var batch = new Batch;
// batch.concurrency(5);

var load = function(url) {
  var deferred = when.defer();
  // console.log('Loading url', url);
  request.get(url, function(error, response) {
    if (error) return deferred.reject(new Error(error));
    if (response.error) return deferred.reject(response.error);
    deferred.resolve(response.text);
  });
  return deferred.promise;
};

// var Batch = require('batch');

// urls.map(load)

// var batchGet = function(urls) {
//   urls.forEach(function(url) {
//     batch.push(function(done) {
//       request
//         .get(url)
//         .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
//         .end(function(error, response) {
//           console.log(url);
//           if (error) throw new Error(error);
//           if (response.error) throw response.error;
//           var result;
//           try {
//             result = progressback(response.text);
//           } catch (err) {
//             error = err;
//           }
//           done(error, result);
//         });
//     });
//   });
// };

// var load = function(url) {

// };

module.exports = load;
