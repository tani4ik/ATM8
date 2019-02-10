const Header = require('./common/headerComponent.js');
const Footer = require('./common/footerComponent.js');
const Helper = require('../support/helper');

class BasePage {

    constructor() {
        this.header = new Header();
        this.footer = new Footer();
        this.helper = new Helper();
    }

    visit() {
        browser.get('http://www.wiggle.co.uk/' + this.url);
        return browser.wait(ec.elementToBeClickable(this.header.logo), GLOBAL_TIMEOUT);
    }

    checkPageTitle(pageTitle) {
        return this.getPageTitle().then((title) => {
            return title === pageTitle;
        });
    }

    getPageTitle() {
        return browser.getTitle();
    }
}

module.exports = BasePage;