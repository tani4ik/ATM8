class Footer {
    constructor() {
        this.footerCategoryLinks = element(by.css('.category-grid-container .bem-footer__link'));
        this.header = element(by.css('.bem-footer'));
    }
}

module.exports = Footer;