var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    }
    else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    }
    else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};


//</editor-fold>

app.controller('ScreenshotReportController', function ($scope, $http) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
    }

    this.showSmartStackTraceHighlight = true;

    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };

    this.convertTimestamp = function (timestamp) {
        var d = new Date(timestamp),
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),
            dd = ('0' + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    };


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };


    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };

    this.applySmartHighlight = function (line) {
        if (this.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return true;
    };

    var results = [
    {
        "description": "should check page title of Product Page|Add and remove item from wishlist",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "67798c37a20551f57ef7a51a447628fa",
        "instanceId": 8664,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.109"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3D%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Flittlelife-toddler-animal-daysack%252F%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517012879,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3D%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Flittlelife-toddler-animal-daysack%252F%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517012880,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517012932,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517012933,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.wiggle.co.uk/littlelife-toddler-animal-daysack/ - The connection used to load resources from https://dynamic.cannedbanners.com used TLS 1.0 or TLS 1.1, which are deprecated and will be disabled in the future. Once disabled, users will be prevented from loading these resources. The server should enable TLS 1.2 or later. See https://www.chromestatus.com/feature/5654791610957824 for more information.",
                "timestamp": 1550517015165,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00600023-00dd-00f4-007b-009900910075.png",
        "timestamp": 1550517017486,
        "duration": 26
    },
    {
        "description": "should select colour and size options|Add and remove item from wishlist",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "67798c37a20551f57ef7a51a447628fa",
        "instanceId": 8664,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.109"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "images\\00eb009a-0037-0087-00aa-005200370060.png",
        "timestamp": 1550517018132,
        "duration": 615
    },
    {
        "description": "should add item to wishlist|Add and remove item from wishlist",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "67798c37a20551f57ef7a51a447628fa",
        "instanceId": 8664,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.109"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "images\\0037003a-00e2-0097-0001-00bf0058008d.png",
        "timestamp": 1550517019396,
        "duration": 183
    },
    {
        "description": "should go to wishlist and check item has been added|Add and remove item from wishlist",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "67798c37a20551f57ef7a51a447628fa",
        "instanceId": 8664,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.109"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Flittlelife-toddler-animal-daysack%252F%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fmywishlist%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=49812476%7CAwAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBAM3ttLXUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAAD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8CABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAQAAAQAAAAABPTwCAFHYAgAAMwgBALhUrQRjTxEA%2F%2F%2F%2F%2FwFPEU8R%2F%2F8BAAABAAAAAAHZlwIAzkgDAAAAAAAAAAFF, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517020726,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Flittlelife-toddler-animal-daysack%252F%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fmywishlist%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=49812476%7CAwAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBAM3ttLXUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAAD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8CABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAQAAAQAAAAABPTwCAFHYAgAAMwgBALhUrQRjTxEA%2F%2F%2F%2F%2FwFPEU8R%2F%2F8BAAABAAAAAAHZlwIAzkgDAAAAAAAAAAFF, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517020726,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517020809,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517020809,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.wiggle.co.uk/mywishlist - The connection used to load resources from https://dynamic.cannedbanners.com used TLS 1.0 or TLS 1.1, which are deprecated and will be disabled in the future. Once disabled, users will be prevented from loading these resources. The server should enable TLS 1.2 or later. See https://www.chromestatus.com/feature/5654791610957824 for more information.",
                "timestamp": 1550517021490,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00bb00a0-004f-000d-001f-005c0002008e.png",
        "timestamp": 1550517020117,
        "duration": 1944
    },
    {
        "description": "should remove item from wishlist|Add and remove item from wishlist",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "67798c37a20551f57ef7a51a447628fa",
        "instanceId": 8664,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.109"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fmywishlist%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fmywishlist%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=619084257%7CBAAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBAMCRDLrUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAAD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8CABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAQAAAQAAAAABPTwCAFHYAgAAMwgBALhUrQRjTxEA%2F%2F%2F%2F%2FwFPEU8R%2F%2F8BAAABAAAAAAHZlwIAzkgDAAAEAF%2FsAADEQf4AAK41%2FwAAahYGAQBeAAAAAUU%3D, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517023513,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fmywishlist%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fmywishlist%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=619084257%7CBAAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBAMCRDLrUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAAD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8CABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAQAAAQAAAAABPTwCAFHYAgAAMwgBALhUrQRjTxEA%2F%2F%2F%2F%2FwFPEU8R%2F%2F8BAAABAAAAAAHZlwIAzkgDAAAEAF%2FsAADEQf4AAK41%2FwAAahYGAQBeAAAAAUU%3D, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517023514,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517023564,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517023564,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.wiggle.co.uk/mywishlist - The connection used to load resources from https://dynamic.cannedbanners.com used TLS 1.0 or TLS 1.1, which are deprecated and will be disabled in the future. Once disabled, users will be prevented from loading these resources. The server should enable TLS 1.2 or later. See https://www.chromestatus.com/feature/5654791610957824 for more information.",
                "timestamp": 1550517024085,
                "type": ""
            }
        ],
        "screenShotFile": "images\\002c009a-00bf-0000-0098-009f007100b0.png",
        "timestamp": 1550517022522,
        "duration": 1950
    },
    {
        "description": "should scroll to the page bottom|Check Wiggle instagram",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "67798c37a20551f57ef7a51a447628fa",
        "instanceId": 8664,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.109"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3D%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252F%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=1476734380%7CBQAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBADJHtLvUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAAD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8CABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAQAAAQAAAAABPTwCAFHYAgAAMwgBALhUrQRjTxEA%2F%2F%2F%2F%2FwFPEU8R%2F%2F8BAAABAAAAAAHZlwIAzkgDAAAEAF%2FsAADEQf4AAK41%2FwAAahYGAQBeAAAAAUU%3D, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517025146,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3D%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252F%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=1476734380%7CBQAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBADJHtLvUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAAD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8CABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAQAAAQAAAAABPTwCAFHYAgAAMwgBALhUrQRjTxEA%2F%2F%2F%2F%2FwFPEU8R%2F%2F8BAAABAAAAAAHZlwIAzkgDAAAEAF%2FsAADEQf4AAK41%2FwAAahYGAQBeAAAAAUU%3D, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517025147,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517025198,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517025198,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.wiggle.co.uk/ - The connection used to load resources from https://dynamic.cannedbanners.com used TLS 1.0 or TLS 1.1, which are deprecated and will be disabled in the future. Once disabled, users will be prevented from loading these resources. The server should enable TLS 1.2 or later. See https://www.chromestatus.com/feature/5654791610957824 for more information.",
                "timestamp": 1550517025997,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00540085-00f6-0070-0008-004700fd0089.png",
        "timestamp": 1550517027183,
        "duration": 3014
    },
    {
        "description": "should go to Wiggle Instagram account|Check Wiggle instagram",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "67798c37a20551f57ef7a51a447628fa",
        "instanceId": 8664,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.109"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "images\\001b0003-005c-0005-00ba-001d001e0011.png",
        "timestamp": 1550517030613,
        "duration": 2342
    },
    {
        "description": "should select colour and size options|Add product to basket and change currency",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "67798c37a20551f57ef7a51a447628fa",
        "instanceId": 8664,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.109"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3D%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Flittlelife-toddler-animal-daysack%252F%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=1394124044%7CBgAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBAPs3rrzUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAAD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8CABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAQAAAQAAAAABPTwCAFHYAgAAMwgBALhUrQRjTxEA%2F%2F%2F%2F%2FwFPEU8R%2F%2F8BAAABAAAAAAHZlwIAzkgDAAAEAF%2FsAADEQf4AAK41%2FwAAahYGAQBeAAAAAUU%3D, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517033966,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3D%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Flittlelife-toddler-animal-daysack%252F%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=1394124044%7CBgAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBAPs3rrzUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAAD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8CABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAQAAAQAAAAABPTwCAFHYAgAAMwgBALhUrQRjTxEA%2F%2F%2F%2F%2FwFPEU8R%2F%2F8BAAABAAAAAAHZlwIAzkgDAAAEAF%2FsAADEQf4AAK41%2FwAAahYGAQBeAAAAAUU%3D, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517033967,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517034016,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517034016,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.wiggle.co.uk/littlelife-toddler-animal-daysack/ - The connection used to load resources from https://dynamic.cannedbanners.com used TLS 1.0 or TLS 1.1, which are deprecated and will be disabled in the future. Once disabled, users will be prevented from loading these resources. The server should enable TLS 1.2 or later. See https://www.chromestatus.com/feature/5654791610957824 for more information.",
                "timestamp": 1550517035115,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00b600b3-0003-00b7-00e2-00ce00400049.png",
        "timestamp": 1550517036315,
        "duration": 522
    },
    {
        "description": "should add product to basket|Add product to basket and change currency",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "67798c37a20551f57ef7a51a447628fa",
        "instanceId": 8664,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.109"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "javascript 0:197 Uncaught TypeError: Cannot read property 'unit_sale_price' of null",
                "timestamp": 1550517037805,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00b20002-00f4-00ff-002b-0085001500aa.png",
        "timestamp": 1550517037561,
        "duration": 237
    },
    {
        "description": "should go to Basket page|Add product to basket and change currency",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "67798c37a20551f57ef7a51a447628fa",
        "instanceId": 8664,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.109"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3D%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fbasket%252F%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=-1167640023%7CCgAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBABCEUMTUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAADOMAIA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8CABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAgAAAQAAAAABPTwCAFHYAgABzjACAAEAAAAzCAEAuFStBGNPEQD%2F%2F%2F%2F%2FAU8RTxH%2F%2FwIAAAEAAAAAAdmXAgDOSAMAAAAAAAAAAUU%3D, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517039029,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3D%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fbasket%252F%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=-1167640023%7CCgAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBABCEUMTUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAADOMAIA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8CABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAgAAAQAAAAABPTwCAFHYAgABzjACAAEAAAAzCAEAuFStBGNPEQD%2F%2F%2F%2F%2FAU8RTxH%2F%2FwIAAAEAAAAAAdmXAgDOSAMAAAAAAAAAAUU%3D, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517039029,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517039080,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517039080,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js 5 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1550517039323,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.wiggle.co.uk/basket/ - The connection used to load resources from https://dynamic.cannedbanners.com used TLS 1.0 or TLS 1.1, which are deprecated and will be disabled in the future. Once disabled, users will be prevented from loading these resources. The server should enable TLS 1.2 or later. See https://www.chromestatus.com/feature/5654791610957824 for more information.",
                "timestamp": 1550517040150,
                "type": ""
            }
        ],
        "screenShotFile": "images\\006c00ed-003c-0025-0040-00a900eb00d2.png",
        "timestamp": 1550517038410,
        "duration": 2502
    },
    {
        "description": "should change currency to Euro|Add product to basket and change currency",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "67798c37a20551f57ef7a51a447628fa",
        "instanceId": 8664,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.109"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fbasket%252F%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fbasket%252F%253Fcurr%253DEUR%2526dest%253D1%2526prevDestCountryId%253D1%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=-465640813%7CDAAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBAMFTEcXUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAADOMAIA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8DABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAgAAAQAAAAABPTwCAFHYAgABzjACAAEAAAAzCAEAuFStBGNPEQD%2F%2F%2F%2F%2FAU8RTxH%2F%2FwIAAAEAAAAAAdmXAgDOSAMAAF%2FsAABmYfDQlk8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAQAAAQAAAAABr1cCACP6AgAAAAAAAAABRQ%3D%3D, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517042807,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/cg/v5/?fv=dmn%3Dwiggle.co.uk%3Bref%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fbasket%252F%3Burl%3Dhttps%253A%252F%252Fwww.wiggle.co.uk%252Fbasket%252F%253Fcurr%253DEUR%2526dest%253D1%2526prevDestCountryId%253D1%3Bscrw%3D1280%3Bscrh%3D720%3Bclrd%3D24%3Bcok%3D1&lver=1.11&jsncl=mmRequestCallbacks%5B1%5D&ri=1&lto=180&srv=fravwcgeu02&pd=-465640813%7CDAAAAApVAwD4yqt%2BTxGa%2FgABEQABQv1U74cBAMFTEcXUldZIKTxftdSV1kgAAAAA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8ABkRpcmVjdAFPEQEAAAAAAAAAAADOMAIA%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8DABvhAACuPxC%2BdE8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAgAAAQAAAAABPTwCAFHYAgABzjACAAEAAAAzCAEAuFStBGNPEQD%2F%2F%2F%2F%2FAU8RTxH%2F%2FwIAAAEAAAAAAdmXAgDOSAMAAF%2FsAABmYfDQlk8RAP%2F%2F%2F%2F8BTxFPEf%2F%2FAQAAAQAAAAABr1cCACP6AgAAAAAAAAABRQ%3D%3D, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517042808,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517042857,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://service.maxymiser.net/api/eu/wiggle.co.uk/303ae1/mmapi.js 13 A parser-blocking, cross site (i.e. different eTLD+1) script, https://service.maxymiser.net/platform/eu/api/mmpackage-1.12.js, is invoked via document.write. The network request for this script MAY be blocked by the browser in this or a future page load due to poor network connectivity. If blocked in this page load, it will be confirmed in a subsequent console message. See https://www.chromestatus.com/feature/5718547946799104 for more details.",
                "timestamp": 1550517042857,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js 5 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1550517043029,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://www.wiggle.co.uk/basket/?curr=EUR&dest=1&prevDestCountryId=1 - The connection used to load resources from https://dynamic.cannedbanners.com used TLS 1.0 or TLS 1.1, which are deprecated and will be disabled in the future. Once disabled, users will be prevented from loading these resources. The server should enable TLS 1.2 or later. See https://www.chromestatus.com/feature/5654791610957824 for more information.",
                "timestamp": 1550517043789,
                "type": ""
            }
        ],
        "screenShotFile": "images\\00eb00ab-00ae-0085-002d-009a006a00f1.png",
        "timestamp": 1550517041351,
        "duration": 3189
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    }
                    else
                    {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.sortSpecs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.sortSpecs();
    }


});

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

