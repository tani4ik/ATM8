const GLOBAL_TIMEOUT = 40e3;
var HtmlReporter = require('protractor-beautiful-reporter');

exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['../test/spec/*.js'],
    capabilities: {
        'browserName': 'chrome'
    },
    onPrepare: function () {
        global.GLOBAL_TIMEOUT = GLOBAL_TIMEOUT;
        global.ec = protractor.ExpectedConditions;

        const chai = require('chai');
        chai.use(require('chai-as-promised'));
        global.expect = chai.expect;
        browser.ignoreSynchronization = true;
        browser.manage().window().maximize();

        // Add a screenshot reporter and store screenshots to `/tmp/screenshots`:
        jasmine.getEnv().addReporter(new HtmlReporter({
            baseDirectory: 'report',
            screenshotsSubfolder: 'images',
            preserveDirectory: false
            }).getJasmine2Reporter());
    }
};
