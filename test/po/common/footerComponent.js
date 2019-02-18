class Footer {
    constructor() {
        this.instagramLink = element(by.css('.bem-footer__social-container a:first-child'));
        this.footer = element(by.css('.bem-footer'));
    }
}

module.exports = Footer;