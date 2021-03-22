var perfNow = function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
      return performance.now();
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
    return (getNanoSeconds() - nodeLoadTime) / 1e6;
  } else if (Date.now) {
      return Date.now() - loadTime;
    };
    return loadTime = Date.now();
  } else {
    loadTime = new Date().getTime();
    return new Date().getTime() - loadTime;
  }
};