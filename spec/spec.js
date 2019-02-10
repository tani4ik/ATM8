browser.ignoreSynchronization = true;
const ProductPage = require('./../po/productPage'),
    WishlistPage = require('./../po/wishlistPage');
    Helper = require('./../support/helper.js');

describe('Add and remove item from wishlist', () => {
    let productPage, wishlistPage, helper;

    beforeAll(() => {
        productPage = new ProductPage();
        wishlistPage = new WishlistPage();
        helper = new Helper();
        return productPage.visit();
    });

    it('should check page title of Product Page', () => {
        expect(productPage.checkPageTitle('Wiggle | LittleLife Toddler Animal Daysack | Rucksacks')).to.eventually.be.true;
    });

    it('should select colour and size options', () => {
        productPage.selectColourAndSizeOptions();
    });

    it('should add item to wishlist', () => {
        helper.waitForVisibilityOf(productPage.addToWishlist, 5000);
        productPage.addItemToWishlist();
    });

    it('should go to wishlist and check item has been added', () => {
        helper.clickToElement(productPage.header.wishlistLink);
        helper.waitForVisibilityOf(wishlistPage.itemPrice, 3000);
        expect(wishlistPage.itemPrice.getText()).to.eventually.be.equal('£14.99');
    });    

    it('should remove item from wishlist', () => {
        wishlistPage.removeFromWishlist();
        expect(wishlistPage.wishlistHeader.getText()).to.eventually.be.equal('Wishlist is empty');
    })
});