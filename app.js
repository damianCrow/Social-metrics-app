// VINE METRICS CODE \\

var demo = document.getElementById('demo');

// GET THE CURRENT DATE \\

function currentDate() {
  var today = new Date();
  var dd = today.getDate();  
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd < 10) {
   dd = '0' + dd
  } 

  if(mm < 10) {
   mm = '0' + mm
  } 

  today = dd + '/' + mm + '/' + yyyy;

  return today;
}

function getInfo(requestType, accountId) {

  if(!accountId) {
    accountId = document.getElementById('account-id').value;
  }

  if(accountId.length < 15 && accountId.match(/^[0-9]+$/) != null) {

    getLiveData(accountId);
  }
  else {

    if(accountId.match(/^[0-9]+$/) != null) {

      var url = 'https://api.vineapp.com/users/profiles/' + accountId;
    }
    else {

      handleResponse('ERROR: Account id is incorrect! Account id should be all digits, for example: 1246689485', 3000);
    }


    $.ajax({
      type: requestType,
      dataType: "jsonp",
      url: 'https://json2jsonp.com/?url='+encodeURIComponent(url),
      success: function(data) {
        
        var getInfoResponseObj = data;

        getAdditionalInfo(accountId, getInfoResponseObj); 
      },
      error: function() {

        handleResponse('ERROR: User not found! Please make sure account id is correct.', 3000);
      }
    });         
  }
}

// GET LIKES AND REVINES INFO FOR THE MOST RECENT 10 POST ON THIS ACCOUNT FROM THE API \\

function getAdditionalInfo(accountId, getInfoResponseObj) {

  var url = 'https://api.vineapp.com/timelines/users/' + accountId;

  $.ajax({
    type: 'GET',
    dataType: "jsonp",
    url: 'https://json2jsonp.com/?url='+encodeURIComponent(url),
    success: function(data) {
      
      var getAdditionalInfoResponseObj = data;

      displayApiResponse(getInfoResponseObj, getAdditionalInfoResponseObj, demo, accountId); 
    }
  });         
}

// CREATE AND DISPLAY TABLE HEADERS \\

var table = document.createElement('table');

function creatTableHeaderRow() {

  var tableHeaders = [
    'Market / Region',
    'Date',
    'Total Reach Potential',
    'Posts',
    'Engagement',
    'New Audience',
    'Total Audience'
  ];

  var headerRow = table.insertRow();
  table.classList.add('table');
  table.id = 'rows2';
  headerRow.classList.add('header-row');

  for(var i = 0; i < tableHeaders.length; i++) {

    var tableHeaderTd = document.createElement('td');
    tableHeaderTd.classList.add('table-header');
    tableHeaderTd.innerHTML = tableHeaders[i];
    headerRow.appendChild(tableHeaderTd);
  }

  demo.appendChild(table);
}

creatTableHeaderRow();

// CREATE A NEW ROW IN THE TABLE \\

function createNewRow(sourceArray) {

  for(var i = 0; i < sourceArray.length; i++) {

    var contentRow = table.insertRow();

    for(var property in sourceArray[i]) {

      if (sourceArray[i].hasOwnProperty(property)) {

        var cell = contentRow.insertCell(-1);
        cell.innerHTML = sourceArray[i][property];  
      }
    }
  }
}

// DISPLAY THE INFO RETURNED FROM THE API \\

function displayApiResponse(getInfoResponseObj, getAdditionalInfoResponseObj, htmlCanvas, accountId) {

  var region = {
    region: getInfoResponseObj.data.username
  }

  var relevantInfo = [];
  var postsArray = getAdditionalInfoResponseObj.data.records;
  var revines = 0;
  var comments = 0;

  for(var i = 0; i < postsArray.length; i++) {

    revines += postsArray[i].reposts.count;
    comments += postsArray[i].comments.count;
  }

  relevantInfo.push({
    region: getInfoResponseObj.data.username,
    date_stamp: currentDate(),
    totalReachPotential: getInfoResponseObj.data.followerCount * getInfoResponseObj.data.postCount,
    posts: getInfoResponseObj.data.postCount,
    engagement: getInfoResponseObj.data.loopCount + revines + getInfoResponseObj.data.likeCount + comments,
    newAudience: 'N/A',
    totalAudience: getInfoResponseObj.data.followerCount
  });

  createNewRow(relevantInfo);
}

function sendArray(array, url, requestType) {

  $.ajax({
    type: requestType,
    url: url,
    data: {data : array}, 
    cache: false,
    success: function(data) {
      
      handleResponse(data, 3000);
    }
  });
}

function handleResponse(data, timeout) {

  $('#loading').html('<h1>'+data+'<h1>').show();

  if(timeout != undefined) {

    setTimeout(function() {

      $('#loading').hide();

    }, timeout)
  }
}

// INSTAGRAM METRICS CODE \\

$('#loading').hide();
$('#loading').height($(window).height());

var count = 0;
var idArrayLength;
var access_token = '16751804.cf0499d.5bbac88dc8004b6d823bea2d95296b4e';
var userID = []; 
var tableArr = [];
var instagramInfoToSave = [];

function getLiveData(accountId) {

  $('#loading').show();

  deleteRows();

  if(accountId) {

    idArrayLength = 1;
    getInstagramData(accountId);
  }
  else {

    $.ajax({
      type: 'GET',
      url: 'instagramAddData.php?accounts=get',
      success: function(data) {

        var dataArray = JSON.parse(data);
        idArrayLength = dataArray.length;

        for(var i = 0; i < dataArray.length; i++) {

          getInstagramData(dataArray[i]);
        }
      }
    });

    $.ajax({
      type: 'GET',
      url: 'vineAddData.php?accounts=get',
      success: function(data) {

        var dataArray = JSON.parse(data);

        for(var i = 0; i < dataArray.length; i++) {

          getInfo('GET', dataArray[i][0]);
        }
      }
    });    
  }
   
  function getInstagramData(userID) {

    $.ajax({
      type: "GET",
      dataType: "jsonp",
      cache: true,
      url: "https://api.instagram.com/v1/users/"+userID+"/?access_token="+access_token,
      success: function(data) {
      
        var tableObj = {id:'', username:'', date:'', totalReachPotential:0, posts:0, engagement:0, newAudience:0, totalAudience:0};
        tableObj.id = data.data.id;
        tableObj.date = currentDate();
        tableObj.username = data.data.username;
        var region = {region: tableObj.username};
        tableObj.totalReachPotential = data.data.counts.media * data.data.counts.followed_by;
        tableObj.posts = data.data.counts.media;
        tableObj.totalAudience = data.data.counts.followed_by;
        tableObj.newAudience = 'N/A';

        var string = '<tr>';
            string+= '<td id="account'+tableObj.id+'">'+tableObj.username+'</td>';
            string+= '<td id="date'+tableObj.id+'">'+tableObj.date+'</td>';
            string+= '<td id="totalReachPotential'+tableObj.id+'">'+tableObj.totalReachPotential+'</td>';
            string+= '<td id="posts'+tableObj.id+'">'+tableObj.posts+'</td>';
            string+= '<td id="newAudience'+tableObj.id+'">'+tableObj.newAudience+'</td>';
            string+= '<td id="totalAudience'+tableObj.id+'">'+tableObj.totalAudience+'</td>';
            string+= '</tr>';

        $('#rows tr:last').after(string);
        $('#loading').html('<h1>'+'Loading data from the Vine & Instragram APIs, please wait...'+'<h1>').show();
        getLikes(tableObj);
      }
    }); 
  }
}

function getLikes(thisObj, thisUrl) {
    var thisUserID = thisObj.id;

    if(thisUrl==undefined) thisUrl = 'https://api.instagram.com/v1/users/'+thisUserID+'/media/recent/?access_token='+access_token;
    
    $.ajax({
      type: "GET",
      dataType: "jsonp",
      cache: true,
      url: thisUrl,
      success: function(data) {
          
        totalLikes = [0];
        totalComments = [0];

        for(a=0; a<data.data.length; a++) {
            if(a>0) totalLikes[a] = totalLikes[a-1] + Number(data.data[a].likes.count);
            else totalLikes[a] = Number(data.data[a].likes.count);

            if(a>0) totalComments[a] = totalComments[a-1] + Number(data.data[a].comments.count);
            else totalComments[a] = Number(data.data[a].comments.count);
        }

        thisObj.engagement += totalLikes[totalLikes.length-1] + totalComments[totalComments.length-1];

        if(data.pagination.next_url != undefined) {
            getLikes(thisObj, data.pagination.next_url);
        } 
        else {
          count ++;

          if(count >= idArrayLength) {
            $('#loading').hide();
          }
          
          $('#posts'+thisUserID).after('<td id="engagement'+thisUserID+'">'+thisObj.engagement+'</td>');
          tableArr.push(thisObj);         
        }
      }
  });
}

// FILTER METRICS BY DATE RANGE CODE \\

function changeDateFormat(dateString) {
  var desiredDateFormat = dateString.split(/[.,/ ]+/).reverse().join('-');
  return desiredDateFormat;
}

function getMetricsByDateRange() {

  var dateValidater = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
  var startDate = document.getElementById('start-date').value;
  var endDate = document.getElementById('end-date').value;

  if(startDate.match(dateValidater) && endDate.match(dateValidater)) {

    deleteRows();

    var dateRange = {
      start: changeDateFormat(startDate), 
      end: changeDateFormat(endDate)
    }

    $.ajax({
      type: 'GET',
      url: 'getMetricsByDateRange.php',
      data: dateRange, 
      cache: false,

      success: function(responseData) {

        var dataArray = JSON.parse(responseData);

        function checkArrayLength(array, secondArray, account) {

          var array1, array2;

          if(array.length > secondArray.length) {
            array2 = secondArray;
            array1 = array;
          }
          else {
            array2 = array;
            array1 = secondArray;
          }

          sortData(array1, array2, startDate, endDate, account);
        }

        checkArrayLength(dataArray[2], dataArray[3], 'vine');

        checkArrayLength(dataArray[0], dataArray[1], 'instagram');
      }
    });
  }
  else {
    handleResponse('ERROR: Invalid date or date format', 3000);
  }
}

function deleteRows() {

  $('tr').not('.header-row').remove();
}

function sortData(array1, array2, startDate, endDate, account) {

  var instagramDisplayArray = [];
  var vineDisplayArray = [];

  function sort(a, b) {

    return a[0] - b[0];
  } 

  if(array2 != undefined && array2.length > 0) {

    $('#loading').html('<h1>'+'Loading data database, please wait...'+'<h1>').show();

    for(var i = 0; i < array2.length; i++) {

      var posts = 0, loops = 0, revines = 0, comments = 0, likes = 0, followers = 0;
      var typedArray = [];
      typedArray.push(array2[i]);

      for(var j = 0; j < array1.length; j++) {

        if(array2[i][2] === array1[j][2]) {

          typedArray.push(array1[j]);
        }
      }

      var groupedArray = typedArray.sort(sort);
      var outputArray = [];

      for(var t = 0; t < groupedArray.length; t++) {

        if(groupedArray[t-1] != undefined) {

          if(account === 'vine') {
            posts += groupedArray[t][3] - groupedArray[t-1][3];
            loops += groupedArray[t][4] - groupedArray[t-1][4];
            revines += groupedArray[t][5] - groupedArray[t-1][5];
            comments += groupedArray[t][6] - groupedArray[t-1][6];
            likes += groupedArray[t][7] - groupedArray[t-1][7];
          }
          else {
            posts += groupedArray[t][3] - groupedArray[t-1][3];
            likes += groupedArray[t][4] - groupedArray[t-1][4];
            comments += groupedArray[t][5] - groupedArray[t-1][5];
          }
        }
      }
      if(account === 'vine') {
  
        followers = parseInt(groupedArray[groupedArray.length - 1][8])  
        var engagement = revines + loops + likes + comments;

        if (engagement < 0) {
          engagement = 0;
        }

        outputArray.push({
          region: groupedArray[0][2], 
          date: startDate + ' - ' + endDate,
          totalReachPotential: posts * followers,
          posts: posts,
          engagement: engagement,
          newAudience: followers - parseInt(groupedArray[0][8]), 
          totalAudience: followers 
        }) 

        vineDisplayArray.push(outputArray);
      }
      else {

        function toTitleCase(str) {

          return str.replace(/\w\S*/g, function(txt) {

            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
        }

        followers = parseInt(groupedArray[groupedArray.length - 1][6])
  
        var string = '<tr>';
            string+= '<td>'+toTitleCase(groupedArray[0][2].replace(/[_-]/g, ''));+'</td>';
            string+= '<td>'+startDate + ' - ' + endDate+'</td>';
            string+= '<td>'+(posts * followers)+'</td>';
            string+= '<td>'+posts+'</td>';

            if (likes + comments < 0) {
              var engagement = 0;
            }
            else {
              engagement = (likes + comments);
            }

            string+= '<td>'+engagement+'</td>';
            string+= '<td>'+(followers - parseInt(groupedArray[0][6]))+'</td>';
            string+= '<td>'+followers+'</td>';
            string+= '</tr>';

        instagramDisplayArray.push(string);
      }
    }
 
    vineDisplayArray.sort(function(a, b) { 

      return a[0].region > b[0].region
    });

    instagramDisplayArray.sort();

    for (var i = 0; i < vineDisplayArray.length; i++) {

      createNewRow(vineDisplayArray[i]);
    }

    for (var i = 0; i < instagramDisplayArray.length; i++) {

      $('#rows tr:last').after(instagramDisplayArray[i]);
    }

    $('#loading').hide();
  }
  else {
   
    handleResponse('ERROR: No data exist for this date range!', 3000);
  }
}

function exportTableToCSV($table, filename) {

  var $rows = $table.find('tr'),

    // Temporary delimiter characters unlikely to be typed by keyboard
    // This is to avoid accidentally splitting the actual contents
    tmpColDelim = String.fromCharCode(11), // vertical tab character
    tmpRowDelim = String.fromCharCode(0), // null character

    // actual delimiter characters for CSV format
    colDelim = '","',
    rowDelim = '"\r\n"',

    // Grab text from table into CSV formatted string
    csv = '"' + $rows.map(function (i, row) {
        var $row = $(row),
            $cols = $row.find('td');

        return $cols.map(function (j, col) {
            var $col = $(col),
                text = $col.text();

            return text.replace(/"/g, '""'); // escape double quotes

        }).get().join(tmpColDelim);

    }).get().join(tmpRowDelim)
        .split(tmpRowDelim).join(rowDelim)
        .split(tmpColDelim).join(colDelim) + '"',

    // Data URI
    csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

  $(this)
      .attr({
      'download': filename,
          'href': csvData,
          'target': '_blank'
  });
}

// This must be a hyperlink

$(".export").on('click', function (event) {
    
    if(this.innerHTML === 'Export Vine table as CSV') {
      exportTableToCSV.apply(this, [$('#rows2'), 'vineTable.csv']);
    }
    else {
      exportTableToCSV.apply(this, [$('#rows'), 'instagramTable.csv']);
    }
});

function addAccountToDatabase() {

  var accountId = document.getElementById('add-account').value;
  var url, dbUrl, dataToSave;

  if(accountId.match(/^[0-9]+$/) != null) {

    if(accountId.length < 14) {

      url = 'https://api.instagram.com/v1/users/' + accountId + '/?access_token=' + access_token;
      dbUrl = 'instagramAddData.php';

      $.ajax({
        dataType: "jsonp",
        type: 'GET',
        url: url,
        success: function(responseData) {

          if(responseData.meta.error_message) {

            confirmAddAccount('ERROR: This account has not been found!');
          }
          else if(responseData.data.username.substring(0, 4).toLowerCase() != 'ford') {

            confirmAddAccount('The username on this account does not begin with the word Ford!', responseData, dbUrl, accountId);
          }
          else {

            var dataToSave = [{
              account: responseData.data.username,
              accountId: accountId
            }];

            sendArray(dataToSave, dbUrl, 'GET');
          }
        }
      });
    }
    else {

      url = 'https://api.vineapp.com/users/profiles/' + accountId;
      dbUrl = 'vineAddData.php';

      $.ajax({
        dataType: "jsonp",
        type: 'GET',
        url: 'https://json2jsonp.com/?url='+encodeURIComponent(url),
        success: function(data) {

          var responseData = JSON.parse(data);

          if(responseData.data.username.substring(0, 4).toLowerCase() != 'ford') {

            confirmAddAccount('The username on this account does not begin with the word Ford!', responseData, dbUrl, accountId);
          }
          else {

            var dataToSave = [{
              account: responseData.data.username,
              accountId: accountId
            }];
            
            sendArray(dataToSave, dbUrl, 'GET');
          }
        },
        error: function() {

          handleResponse('ERROR: This account has not been found!', 3000);
        }
      });
    }
  }
  else {

    handleResponse('ERROR: Incorrect account id! Account IDs should be all digits, for example: 124648588724', 3000);
  }
}

function confirmAddAccount(message, responseData, dbUrl, accountId) {

  if(responseData == undefined) {

    handleResponse(message, 3000);
  }
  else {

    $('#loading').html('<h1>'+message+'<h1>' + 
      '<br>' + 
      '<button id="continue">' + "Add account anyway" + '</button>' +
      '<button id="cancel">' + "Cancel" + '</button>'
    ).show();

    $('#continue').click(function() {

       var dataToSave = [{
        account: responseData.data.username,
        accountId: accountId
      }];
      
      sendArray(dataToSave, dbUrl, 'GET');

      $('#loading').hide();
    })

    $('#cancel').click(function() {

      $('#loading').hide();
    })
  }
}