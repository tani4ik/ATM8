class Header {
    constructor() {
        this.logo = element(by.css('#wiggle-logo'));
        this.header = element(by.css('.bem-megamenu__head-container'));
        this.yourAccountLink = element(by.css('#accountLink')); 
        this.wishlistLink = element(by.css('#wishlistLink'));
        this.basketLink = element(by.css('.bem-header__basket--active'));
        this.searchInput = element(by.css('.bem-header__search'));
        this.languageAndCountrySelector = element(by.css('.bem-header__language-selector'));
        this.selectLanguage = element(by.css('#langId'));
        this.selectCurrency = element(by.css('#currencyId'));
        this.selectDeliveryDestination = element(by.css('#countryId'));
        this.updateLanguageAndCountry = element(by.css('.bem-language-selector__button'));
    }
}

module.exports = Header;