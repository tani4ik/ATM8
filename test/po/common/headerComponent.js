class Header {
    constructor() {
        this.logo = element(by.css('#wiggle-logo'));
        this.header = element(by.css('.bem-megamenu__head-container'));
        this.yourAccountLink = element(by.css('#accountLink')); 
        this.wishlistLink = element(by.css('#wishlistLink'));
        this.basketLink = element(by.css('.bem-header__basket--active'));
        this.searchInput = element(by.css('.bem-header__search'));
    }
}

module.exports = Header;