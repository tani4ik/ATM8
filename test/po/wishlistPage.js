const BasePage = require('./basePage');

class WishlistPage extends BasePage {
    constructor() {
        super();
        this.url = '/mywishlists/';
        this.wishlistHeader = element(by.css('.bem-wishlist__box-title'));
        this.itemPrice = element(by.css('.qa-wishlist-item-price'));
        this.deleteItem = element(by.css('a.bem-wishlist__box-delete'));
        this.deleteDialogue = element(by.css('.bem-wishlist__item-delete-dialogue'));
        this.confirmDelete = element(by.css('.bem-wishlist__box-item-delete'));
    }

    removeFromWishlist() {
        this.deleteItem.click();
        this.helper.waitForVisibilityOf(this.confirmDelete);
        this.confirmDelete.click();
    }

}

module.exports = WishlistPage;