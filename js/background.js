var BackgroundTasks, bk;

BackgroundTasks = (function() {

  function BackgroundTasks() {}

  BackgroundTasks.prototype.init = function() {
    var _this = this;
    chrome.contextMenus.create({
      title: "Download link with Aria2",
      contexts: ["link"],
      onclick: function(info, tab) {
        return _this.downloadLink(info, tab);
      }
    });
    return chrome.contextMenus.create({
      title: "Download %s with Aria2",
      contexts: ["link"],
      onclick: function(info, tab) {
        return _this.downloadLink(info, tab, info.selectionText);
      }
    });
  };

  BackgroundTasks.prototype.downloadLink = function(info, tab, filename) {
    var jobOptions,
      _this = this;
    jobOptions = {
      headers: ['Referer: ' + tab.url, 'User-Agent: ' + window.navigator.userAgent]
    };
    if (filename) jobOptions.filename = filename;
    return chrome.cookies.getAll({
      url: info.linkUrl
    }, function(cookies) {
      var cookie, header;
      if (cookies.length) {
        header = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = cookies.length; _i < _len; _i++) {
            cookie = cookies[_i];
            _results.push(cookie.name + "=" + cookie.value);
          }
          return _results;
        })();
        jobOptions.headers.push("Cookie: " + header.join("; "));
      }
      console.info(jobOptions);
      return _this.findOrCreateAppTab(function(tab) {
        return chrome.tabs.sendMessage(tab.id, {
          event: 'task.add',
          uri: info.linkUrl,
          options: jobOptions
        });
      });
    });
  };

  BackgroundTasks.prototype.findOrCreateAppTab = function(callback) {
    var url,
      _this = this;
    url = chrome.extension.getURL('index.html');
    return chrome.tabs.query({
      url: url
    }, function(tabs) {
      if (tabs.length) {
        chrome.tabs.update(tabs[0].id, {
          active: true
        });
        return callback(tabs[0]);
      } else {
        return chrome.tabs.create({
          url: url
        }, callback);
      }
    });
  };

  return BackgroundTasks;

})();

bk = new BackgroundTasks();

bk.init();
