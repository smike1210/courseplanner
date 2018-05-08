/*
calls course explorer api to get data for desired semester and converts data into
json.
*/

var parseString = require('xml2js').parseString;
var http = require('https');
var fs = require('fs');



//taken from http://antrikshy.com/blog/fetch-xml-url-convert-to-json-nodejs
function xmlToJson(url, callback, path) {
  var req = http.get(url, function(res) {
    var xml = '';

    res.on('data', function(chunk) {
      xml += chunk;
    });

    res.on('error', function(e) {
      callback(e, null);
    });

    res.on('timeout', function(e) {
      callback(e, null);
    });

    res.on('end', function() {
      parseString(xml, function(err, result) {
        callback(null, result, path);
      });
    });
  });
}

function callback(err, data, path) {
  if (err) {
    return console.err(err);
  }
  fs.writeFile(path, JSON.stringify(data, null, 2), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log(path + " was saved!");
  });
  //console.log(JSON.stringify(data, null, 2)) ;
}

var url1 = 'https://courses.illinois.edu/cisapp/explorer/schedule/2018/spring/CS.xml?mode=cascade'
var url2 = 'https://courses.illinois.edu/cisapp/explorer/schedule/2017/fall/CS.xml?mode=cascade'

var filePath2017 =__dirname+"/2017Data.json";
var filePath2018 = __dirname+"/2018Data.json";

xmlToJson(url1,callback, filePath2017);
xmlToJson(url2,callback,filePath2018);
