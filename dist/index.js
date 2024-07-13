var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
var inBrowser = typeof navigator !== "undefined";
var unsupportedUserAgentsPattern = /Windows.*Chrome|Windows.*Firefox|Linux.*Chrome/;
var ping = function (_a) {
    var url = _a.url, timeout = _a.timeout;
    return new Promise(function (resolve) {
        var isOnline = function () { return resolve(true); };
        var isOffline = function () { return resolve(false); };
        var xhr = new XMLHttpRequest();
        xhr.onerror = isOffline;
        xhr.ontimeout = isOffline;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === xhr.HEADERS_RECEIVED) {
                xhr.status ? isOnline() : isOffline();
            }
        };
        xhr.open("GET", url);
        xhr.timeout = timeout;
        xhr.send();
    });
};
var defaultPollingConfig = {
    enabled: inBrowser && unsupportedUserAgentsPattern.test(navigator.userAgent),
    url: "https://httpbin.org/get",
    timeout: 5000,
    interval: 5000
};
var useNetworkStatus = function (pollingConfig, onPoll) {
    var _a = useState(inBrowser && typeof navigator.onLine === "boolean" ? navigator.onLine : true), online = _a[0], setOnline = _a[1];
    useEffect(function () {
        var goOnline = function () { return setOnline(true); };
        var goOffline = function () { return setOnline(false); };
        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);
        var pollingId = null;
        var config = __assign(__assign({}, defaultPollingConfig), pollingConfig);
        if (config.enabled) {
            pollingId = setInterval(function () {
                ping({ url: config.url, timeout: config.timeout }).then(function (isOnline) {
                    if (isOnline !== online) {
                        setOnline(isOnline);
                    }
                    if (onPoll)
                        onPoll({ online: isOnline });
                });
            }, config.interval);
        }
        return function () {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
            if (pollingId)
                clearInterval(pollingId);
        };
    }, [online, pollingConfig, onPoll]);
    return online;
};
export var Detector = function (_a) {
    var config = _a.config, onPoll = _a.onPoll, render = _a.render;
    var online = useNetworkStatus(config, onPoll);
    return _jsx(_Fragment, { children: render({ online: online }) });
};
