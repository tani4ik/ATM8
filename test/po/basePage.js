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

    checkPageURL(pageURL) {
        return browser.executeScript('return document.URL').then((url) => {
            return url === pageURL;
        })
    }

    getPageTitle() {
        return browser.getTitle();
    }

    scrollToBottom() {
        return browser.executeScript('window.scrollTo(0, document.body.scrollHeight)').
            then(() => {
                return browser.sleep(3000);
            }) 
    }

}

module.exports = BasePage;