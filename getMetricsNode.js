var http = require('http');
var urlObj = require('url');
var async = require('async');
var requestObj = require('request');
var port = 8080;
var access_token = '16751804.cf0499d.5bbac88dc8004b6d823bea2d95296b4e';

// getAccounts('http://localhost:1314/vine&InstagramMetrics/vineAddData.php?accounts=get', 'vine');
// getAccounts('http://localhost:1314/vine&InstagramMetrics/instagramAddData.php?accounts=get', 'instagram');

function getAccounts(url, media) {

	requestObj.get(url, function (error, response, body) {

	  if(!error && response.statusCode === 200) {

	  	var data = JSON.parse(body);

	  	for(var i = 0; i < data.length; i++) {

	      getData(data[i][0], media);
	    } 
	  }
	  else {
	  	console.log(error); 
	  }
	})
}

function getData(accountId, media) {

	var url;

	if(media === 'vine') {

		url = 'https://api.vineapp.com/users/profiles/' + accountId;
	}
	else {

		url = 'https://api.instagram.com/v1/users/' + accountId + '/?access_token=' + access_token;
	}

	requestObj.get(url, function (error, response, body) {

	  if(!error && response.statusCode === 200) {

	  	var getDataResponseObj = JSON.parse(body);

	  	getAdditionalData(accountId, getDataResponseObj, media); 
	  }
	  else {
	  	console.log(error); 
	  }
	})
}

function getAdditionalData(accountId, getDataResponseObj, media, url, storedMedia) {

	if(!url) {

		var url;

		if(media === 'vine') {

			url = 'https://api.vineapp.com/timelines/users/' + accountId;
		}
		else {

			url = 'https://api.instagram.com/v1/users/'+ accountId +'/media/recent/?access_token='+access_token;
		}
	}

	requestObj.get(url, function (error, response, body) {

	  if(!error && response.statusCode === 200) {

	  	var additionalDataResponseObj = JSON.parse(body);

	  	if (storedMedia === undefined) {

	  		sortData(getDataResponseObj, additionalDataResponseObj, media, accountId);
	  	}
	  	else {

	  		sortData(getDataResponseObj, additionalDataResponseObj, media, accountId, storedMedia);
	  	}  
	  }
	  else {
	  	console.log(error); 
	  }
	})
}
       
function sortData(response1, response2, media, accountId, storedMedia) {

	if(media === 'vine') {

		var revines = 0;
	  var comments = 0;

	  for(var i = 0; i < response2.data.records.length; i++) {

	    revines += response2.data.records[i].reposts.count;
	    comments += response2.data.records[i].comments.count;
	  }

	  vineDataToSave = {
	    region: response1.data.username, 
	    posts: response1.data.postCount,
	    loopCount: response1.data.loopCount,
	    revines: revines,
	    comments: comments,
	    likes: response1.data.likeCount,
	    followers: response1.data.followerCount
	  };

	  sendData(vineDataToSave, 'http://localhost:1314/vine&InstagramMetrics/vineAddData.php');
	}

	if(media === 'instagram') {

		var totalLikes = 0, totalComments = 0;

		for(var a = 0; a < response2.data.length; a++) {

      totalLikes += response2.data[a].likes.count;
      totalComments += response2.data[a].comments.count;
    }

    if(response2.pagination.next_url == undefined) {

    	if (storedMedia == undefined) {

    		createSaveObject(totalLikes, totalComments);
    	}
			else {

				storedMedia[0] += totalLikes;
				storedMedia[1] += totalComments;
				createSaveObject(storedMedia[0], storedMedia[1]);
			}
		}
		
		if(response2.pagination.next_url != undefined) {

			if (storedMedia == undefined) {

				var storedMedia = [totalLikes, totalComments];
			}
			else {
				storedMedia[0] += totalLikes;
				storedMedia[1] += totalComments;
			}

			getAdditionalData(accountId, response1, 'instagram', response2.pagination.next_url, storedMedia);	
		}

    function createSaveObject(likes, comments) {

      var instagramDataToSave = {
        username: response1.data.username,
        posts: response1.data.counts.media,
        likes: likes,
        comments: comments,
        followers: response1.data.counts.followed_by
      };

      sendData(instagramDataToSave, 'http://localhost:1314/vine&InstagramMetrics/instagramAddData.php');
    }
	}
}  

var count = 0;
function sendData(objToSend, url) {

	requestObj.post({url: url, formData: objToSend}, function(error, response, body) {

	 if(response.statusCode === 200){
	 	
		count += 1;
	 	console.log('ok ' + count);
	 }
	 else {
	 	console.log(error);
	 }
	});
}  

http.createServer(function(request, response) {

	response.writeHead(200, { 
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*' 
  });

  var parsedUrl = urlObj.parse(request.url, true); 
  var queryObject = parsedUrl.query;

  request.on('error', function(err) {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });

  if(request.method === 'GET') {

  	var accountId = queryObject.accountNumber;
		var caller = queryObject.callerFunction;

		var url = 'https://api.vineapp.com/users/profiles/' + accountId;
		var url2 = 'https://api.vineapp.com/timelines/users/' + accountId;

  	async.series([

	    function(callback){

				requestObj.get(url, function (error, response, body) {

				  if(!error && response.statusCode === 200) {

				  	var getDataResponseObj = JSON.parse(body);

				  	if(caller === 'addAccountToDatabase') {

				  		callback(null, getDataResponseObj);

				  		return;
				  	}
				  	else {

				  		callback(null, getDataResponseObj);
				  	}
	      	}
	      	else {
				  	callback(error);
				  }
	      })
	    },
	    function(callback){
	      
	      requestObj.get(url2, function (error, response, body) {

				  if(!error && response.statusCode === 200) {

				  	var additionalDataResponseObj = JSON.parse(body);

				  	callback(null, additionalDataResponseObj);
				  }
				  else {

				  	callback(error); 
				  }
				})
	    }
		],
		
		function(err, results){

			response.end(JSON.stringify(results));
		});
  } 
  else {
    response.statusCode = 404;
    response.end();
  }
}).listen(port);       