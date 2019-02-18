const BasePage = require('./basePage');

class BasketPage extends BasePage {
    constructor() {
        super();
        this.url = '/basket/';
        this.basketHeader = element(by.css('#bag-title h1'));
        this.continueCheckout = element(by.css('#continue-checkout'));
        this.removeItem = element(by.css('a.remove'));
        this.selectCountry = element(by.css('#ddlDestination'));
        this.giftVoucher = element(by.css('#txtVoucher'));
        this.addGiftVoucher = element(by.css('#AddCode'));
        this.itemsSubtotal = element(by.css('#basket-totals .subtotal .amount'));
        this.plusOneItem = element(by.css('.quantity-plus'));
        this.minusOneItem = element(by.css('.quantity-minus'));
        this.itemName = element(by.css('a.item-name'));
    }

    continueToCheckout() {
        this.continueCheckout.click();
    }

    removeItemFromBasket() {
        this.removeItem.click();
    }

    increaseItemQuantity() {
        this.plusOneItem.click();
    }

    decreaseItemQuantity() {
        this.minusOneItem.click();
    }

}

module.exports = BasketPage;