var UPDATE_INTERVAL = 5;
var TYPE = {
  today: "today",
  average: "average",
  all: "all"
};

var mode = TYPE.today;

setDefaults();
// Set default settings
function setDefaults() {
  
  if (!localStorage["num_days"]) 
    localStorage["num_days"] = 1;
  
  if (!localStorage["date"]) 
    localStorage["date"] = new Date().toLocaleDateString();
  
  if (!localStorage["domains"]) 
    localStorage["domains"] = JSON.stringify({});
  
  if (!localStorage["total"]) {
    localStorage["total"] = JSON.stringify({
      today: 0,
      all: 0
    });
  }

  localStorage["chart_limit"] = 9;
  
  if (!localStorage["other"]) {
    localStorage["other"] = JSON.stringify({
      today: 0,
      all: 0
    });
  }
}

function combineEntries(threshold) {
  var domains = JSON.parse(localStorage["domains"]);
  var other = JSON.parse(localStorage["other"]);
  if (Object.keys(domains).length <= threshold) 
    return;
  
  var data = [];
  for (var domain in domains) {
    var domain_data = JSON.parse(localStorage[domain]);
    data.push({
      domain: domain,
      all: domain_data.all
    });
  }
  data.sort(function (a, b) {
    return b.all - a.all;
  });
  for (var i = threshold; i < data.length; i++) {
    other.all += data[i].all;
    var domain = data[i].domain;
    delete localStorage[domain];
    delete domains[domain];
  }
  localStorage["other"] = JSON.stringify(other);
  localStorage["domains"] = JSON.stringify(domains);
}


function checkDate() {
  var todayStr = new Date().toLocaleDateString();
  var saved_day = localStorage["date"];
  if (saved_day !== todayStr) {
    var domains = JSON.parse(localStorage["domains"]);
    for (var domain in domains) {
      var domain_data = JSON.parse(localStorage[domain]);
      domain_data.today = 0;
      localStorage[domain] = JSON.stringify(domain_data);
    }
    var total = JSON.parse(localStorage["total"]);
    total.today = 0;
    localStorage["total"] = JSON.stringify(total);
    combineEntries(500);
    localStorage["num_days"] = parseInt(localStorage["num_days"]) + 1;
    localStorage["date"] = todayStr;
  }
}

function extractDomain(url) {
  var re = /:\/\/(www\.)?(.+?)\//;
  return url.match(re)[2];
}


function updateData() {
  chrome.idle.queryState(30, function (state) {
    if (state === "active") {
      chrome.tabs.query({ 'lastFocusedWindow': true, 'active': true }, function (tabs) {
        if (tabs.length === 0) 
          return;
        var tab = tabs[0];
        checkDate();

          var domain = extractDomain(tab.url);
          var domains = JSON.parse(localStorage["domains"]);
          if (!(domain in domains)) {
            domains[domain] = 1;
            localStorage["domains"] = JSON.stringify(domains);
          }
          var domain_data;
          if (localStorage[domain]) 
            domain_data = JSON.parse(localStorage[domain]);
           else {
            domain_data = {
              today: 0,
              all: 0
            };
          }
          domain_data.today += UPDATE_INTERVAL;
          domain_data.all += UPDATE_INTERVAL;
          localStorage[domain] = JSON.stringify(domain_data);
          var total = JSON.parse(localStorage["total"]);
          total.today += UPDATE_INTERVAL;
          total.all += UPDATE_INTERVAL;
          localStorage["total"] = JSON.stringify(total);
          var num_min = Math.floor(domain_data.today / 60).toString();
          if (num_min.length < 4) 
            num_min += "m";
          chrome.browserAction.setBadgeText({
            text: num_min
          });
      });
    }
  });
}

setInterval(updateData, UPDATE_INTERVAL * 1000);
