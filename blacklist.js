var bg = chrome.extension.getBackgroundPage();

function save_options() {
  var blackListEl = document.getElementById("blacklist");
  var blacklist_domains = blackListEl.value.split(/\r?\n/);
  var blacklist = [];
  for (var i = 0; i < blacklist_domains.length; i++) {
    var domain = blacklist_domains[i];
    if (domain) 
      blacklist.push(domain);
  }
  blackListEl.value = blacklist.join('\n');
  localStorage["blacklist"] = JSON.stringify(blacklist);

  var domains = JSON.parse(localStorage["domains"]);
  for (var domain in domains) {
    for (var i = 0; i < blacklist.length; i++) {
      if (domain.match(blacklist[i])) {
        delete domains[domain];
        delete localStorage[domain];
        localStorage["domains"] = JSON.stringify(domains);
      }
    }
  }


  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  status.className = "success";
  setTimeout(function() {
    status.innerHTML = "";
    status.className = "";
  }, 750);
}


function restore_options() {
  var blacklist = JSON.parse(localStorage["blacklist"]);
  var blackListEl = document.getElementById("blacklist");
  blackListEl.value = blacklist.join('\n');
  var limitEl = document.getElementById("chart_limit");
  limitEl.value = localStorage["chart_limit"];
}


document.addEventListener('DOMContentLoaded', function () {
  restore_options();

  document.querySelector('#save-button').addEventListener('click', save_options);
  var rows = document.querySelectorAll('tr');
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    row.addEventListener('mouseover', mouseoverHandler);
    row.addEventListener('mouseout', mouseoutHandler);
  }
});
