var bg = chrome.extension.getBackgroundPage();

google.load('visualization', '1.0', {'packages':['table']});
  google.setOnLoadCallback(function () {
    if (bg.mode === bg.TYPE.today) 
      show(bg.TYPE.today);
     else if (bg.mode === bg.TYPE.average) 
      show(bg.TYPE.average);
     else if (bg.mode === bg.TYPE.all) 
      show(bg.TYPE.all);
  });


function timeString(numSeconds) {
  if (numSeconds === 0) 
    return "0 seconds";
  var remainder = numSeconds;
  var timeStr = "";
  var timeTerms = {
    hour: 3600,
    minute: 60,
    second: 1
  };
  if (remainder >= timeTerms.hour) {
    remainder = remainder - (remainder % timeTerms.minute);
    delete timeTerms.second;
  }
  for (var term in timeTerms) {
    var divisor = timeTerms[term];
    if (remainder >= divisor) {
      var numUnits = Math.floor(remainder / divisor);
      timeStr += numUnits + " " + term;
      if (numUnits > 1) 
        timeStr += "s";
      remainder = remainder % divisor;
      if (remainder) 
        timeStr += " and ";
    }
  }
  return timeStr;
}

function displayData(type) {
  var domains = JSON.parse(localStorage["domains"]);
  var chart_data = [];
  for (var domain in domains) {
    var domain_data = JSON.parse(localStorage[domain]);
    var numSeconds = 0;
    if (type === bg.TYPE.today) 
      numSeconds = domain_data.today;
     else if (type === bg.TYPE.average) 
      numSeconds = Math.floor(domain_data.all / parseInt(localStorage["num_days"], 10));
     else if (type === bg.TYPE.all) 
      numSeconds = domain_data.all;
     else 
      console.error("No such type: " + type);
    if (numSeconds > 0) {
      chart_data.push([domain, {
        v: numSeconds,
        f: timeString(numSeconds),
        p: {
          style: "text-align: left; white-space: normal;"
        }
      }]);
    }
  }

  if (chart_data.length === 0) 
    document.getElementById("nodata").style.display = "inline";
   else 
    document.getElementById("nodata").style.display = "none";
  
  chart_data.sort(function (a, b) {
    return b[1].v - a[1].v;
  });

  var limited_data = [];
  var chart_limit;
  chart_limit = 9;
  
  for (var i = 0; i < chart_limit && i < chart_data.length; i++) 
    limited_data.push(chart_data[i]);
  
  var sum = 0;
  for (var i = chart_limit; i < chart_data.length; i++) 
    sum += chart_data[i][1].v;
  
  var other = JSON.parse(localStorage["other"]);
  if (type === bg.TYPE.average) 
    sum += Math.floor(other.all / parseInt(localStorage["num_days"], 10));
   else if (type === bg.TYPE.all) 
    sum += other.all;
  
  if (sum > 0) {
    limited_data.push(["Other", {
      v: sum,
      f: timeString(sum),
      p: {
        style: "text-align: left; white-space: normal;"
      }
    }]);
  }


  var total = JSON.parse(localStorage["total"]);
  var numSeconds = 0;
  if (type === bg.TYPE.today) 
    numSeconds = total.today;
   else if (type === bg.TYPE.average) 
    numSeconds = Math.floor(total.all / parseInt(localStorage["num_days"], 10));
   else if (type === bg.TYPE.all) 
    numSeconds = total.all;
  
  limited_data.push([{
    v: "Total",
    p: {
      style: "font-weight: bold;"
    }
  }, {
    v: numSeconds,
    f: timeString(numSeconds),
    p: {
      style: "text-align: left; white-space: normal; font-weight: bold;"
    }
  }]);

  drawTable(limited_data, type);
}


function show(mode) {
  bg.mode = mode;
  displayData(mode);
  document.getElementById('today').className = '';
  document.getElementById('average').className = '';
  document.getElementById('all').className = '';
  document.getElementById(mode).className = 'active';
}

function drawTable(table_data, type) {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Site');
  var timeDesc;
  if (type === bg.TYPE.today) 
    timeDesc = "Today";
   else if (type === bg.TYPE.average) 
    timeDesc = "Daily Average";
   else if (type === bg.TYPE.all) 
    timeDesc = "Over " + localStorage["num_days"] + " Days";
  
  data.addColumn('number', "Time Spent (" + timeDesc + ")");
  data.addRows(table_data);

  var options = {
    allowHtml: true,
    sort: 'disable'
  };
  var table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(data, options);
}


document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#today').addEventListener('click', function() { show(bg.TYPE.today); });
  document.querySelector('#average').addEventListener('click', function() { show(bg.TYPE.average); });
  document.querySelector('#all').addEventListener('click', function() { show(bg.TYPE.all); });
});
