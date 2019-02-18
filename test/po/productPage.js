const BasePage = require('./basePage');

class ProductPage extends BasePage {
    constructor() {
        super();
        this.url = '/littlelife-toddler-animal-daysack/';
        this.colourDropdown = element.all(by.css('.bem-sku-selector__option-prompt'));
        this.colourOption = element.all(by.css('.bem-sku-selector__option-group-item'));
        this.addToWishlist = element(by.css('.bem-sku-selector__wishlist:not(.hide)'));
        this.itemPrice = element(by.css('.js-unit-price'));
        this.addToBasket = element(by.css('#quickBuyButton'));
    }

    selectColourAndSizeOptions() {
        this.colourDropdown.first().click()
            .then(() => {
                return this.colourOption.first().click();
            })
    }

    addItemToWishlist() {
        return this.addToWishlist.click();
    }

    addItemToBasket() {
        return this.addToBasket.click();
    }

}

module.exports = ProductPage;