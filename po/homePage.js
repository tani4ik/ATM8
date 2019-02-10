const BasePage = require('./basePage');

class HomePage extends BasePage {
    constructor() {
        super();
        this.url = '';
        this.banner = element(by.css('.absPlace'));
    }

    homePageShouldBeFullyDisplayed() {
        return this.banner.isDisplayed().then(function (isDisplayed) {
            return expect(isDisplayed).to.be.true;
        })
    };
}

module.exports = HomePage;