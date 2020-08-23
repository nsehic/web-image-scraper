const fetch = require('node-fetch');

const download = function(uri, callback){
  fetch(uri).then(res => {
    callback(res);
  }).catch(err => console.log(err));
 
};


module.exports = download;