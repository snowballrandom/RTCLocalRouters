var activeCount = 0;
var maxCount = 10;
var timer = 0;
var found = 0;
var conn = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var localip = false;
var firsttry = false;
var didfirst = false;
var iplist = ["192.168.1.1","192.168.0.1","192.168.2.1","192.168.1.254","192.168.0.50",
    "192.168.10.1","192.168.100.1","192.168.123.254","192.168.88.1","192.168.11.1","192.168.1.2",
    "10.0.0.1","192.168.0.254","172.19.3.1","192.168.1.240","192.168.3.1","192.168.1.250","192.168.1.245",
    "10.0.0.138","192.168.15.1","192.168.0.100","10.1.1.1","192.168.8.1","192.168.0.30","192.168.254.254",
    "192.168.0.20","10.0.0.2","192.168.1.252","192.168.20.1","192.168.0.10","10.10.10.254","192.168.1.20",
    "192.168.10.100","192.168.2.2","192.168.30.1","192.168.100.252","192.168.62.1","10.0.1.1","192.168.1.230",
    "192.168.2.254","192.168.16.1","192.168.168.168","192.168.1.200","10.10.10.1","10.0.10.254","192.168.168.1",
    "192.168.0.250","192.168.200.1","10.1.0.99","192.168.1.100","192.168.31.1","192.168.1.253","192.168.0.101",
    "192.168.11.100","192.168.50.1","192.168.61.1","192.168.178.1","172.16.0.1","192.168.1.10","192.168.111.1",
    "192.168.0.4","192.168.0.40","192.168.1.251","192.168.1.99","192.0.2.1","192.168.0.2","192.168.0.200","10.8.0.99",
    "172.16.16.16","192.168.16.254","10.128.128.128","192.168.123.1","10.90.90.90","192.168.1.225","192.168.169.1",
    "192.158.11.1","192.168.1.33","192.0.0.64","192.168.1.50","192.168.0.228","192.168.1.115","192.168.1.11","192.168.0.90",
    "192.168.11.150","192.168.0.35","192.168.85.1","192.168.9.2","10.100.1.1","192.168.229.61","192.168.0.11","192.168.1.168",
    "192.168.1.108"];

if (conn) {
    conn = new RTCPeerConnection({
        iceServers: []
    });
    tmp = function() {};
    conn.createDataChannel("");
    conn.createOffer(conn.setLocalDescription.bind(conn), tmp);
    conn.onicecandidate = function (d) {
        if (!d || !d.candidate || !d.candidate.candidate)  return;
        localip = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(d.candidate.candidate)[1];
        firsttry = localip.replace(/\.\d{1,3}$/,'.1');
        iplist.unshift(firsttry);
    };
}
function startDetect () {
    if (localip) {
        var html = '<li class="list-group-item">Your Ip: <strong>'+localip+'</strong></li>';
        $('#detectPanel').append(html);
        if (localStorage.getItem('detected')) {
            html = html + localStorage.getItem('detected');
        }
        localStorage.setItem('detected',html);

        localip = false;
    }
    if (found <5 && iplist.length && activeCount<maxCount) {
        for (var i = 0; i < maxCount-activeCount; i++) {
            if (iplist.length) {
                activeCount++;
                var ip = iplist.shift();
                while(ip == firsttry && didfirst == true) {
                    ip = iplist.shift();
                }
                didfirst = true;
                detectCall(ip);
            }
        }
    }
    timer = setTimeout(function() {
        startDetect();

        if (!iplist.length) {
            $('#detectSpin').hide();
        }
    },100);
    /*
        while (iplist.length) {
            detectCall(iplist.shift());
        }
    */
}
function detectCall(a) {
    var xhr = new XMLHttpRequest(),    method = "GET",    url = "https://"+a+"/";
    xhr.timeout = 500;
    xhr.ontimeout = function(e) {
        xhr.abort();
        delete xhr;
        activeCount--;
    };
    xhr.success = function(e) {
        xhr.abort();
        delete xhr;
        activeCount--;
        detectAdd(a);
    };
    xhr.onerror = function(e) {
        xhr.abort();
        delete xhr;
        activeCount--;
        detectAdd(a);
    };
    xhr.open(method,url,true);
    xhr.send();
    /*
          $.ajax({
              url: 'https://'+a+':80',
              timeout: 500,
              success: function(d,s,x) {
                    activeCount--;
                    detectAdd(a);
              },
              error: function(x,s,e) {
                activeCount--;
                if (s == 'error') {
                    detectAdd(a);
                }
              }
          });
    */
}
function checkAlreadyDetected() {
    var html = localStorage.getItem('detected');
    if (html) {
        $('#detectPanel').append(html);
        $('#detectPanel').parent().removeClass('panel-primary').addClass('panel-danger');
        $('#detectBody').html('We have detected the following devices on your network.  Click to go to the Admin Page.');
        $('#detectSpin').hide();
        return true;
    }
    return false;
}
function detectAdd(a) {
    found++;
    var html = '<a target="_new" href="http://'+a+'" class="list-group-item ipdetected">'+a+'<span class="pull-right">Load Admin <span class="fa fa-external-link"></span></span></a>';
    $('#detectPanel').append(html);
    if (localStorage.getItem('detected')) {
        html = html + localStorage.getItem('detected');
    }
    localStorage.setItem('detected',html);
    $('#detectPanel').parent().removeClass('panel-primary').addClass('panel-danger');
    $('#detectBody').html('We have detected the following devices on your network.  Click to go to the Admin Page.');

}

$(document).ready(function() {
    if (!checkAlreadyDetected()) {
        startDetect();
    }
});
