'use strict';

var isNode = typeof window === 'undefined'

function stubFetchAPI(spy, data, dataType) {
  data = data || '{}';

  var response = { status: 200 };
  if (dataType) {
    response[dataType] = spy;
  }
  else {
    response.json = spy;
    response.text = spy;
  }

  return sinon.stub(global, 'fetch', function(path, options) {
    return {
      then: function(callback0) {
        callback0.call(this, response);
        return {
          then: function(callback1) {
            callback1.call(this, response);
            return {
              then: function(callback2) {
                callback2.call(this, data);
                return {
                  catch: function(callback3) {
                    callback3.call(this, new Error('Fetch Error'));
                  }
                }
              }
            }
          }
        }
      }
    }
  });
}

if (typeof module !== 'undefined') module.exports = { stubFetchAPI: stubFetchAPI };
