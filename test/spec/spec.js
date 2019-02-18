const ProductPage = require('./../po/productPage'),
    WishlistPage = require('./../po/wishlistPage');
    HomePage = require('./../po/homePage');
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

describe ('Check Wiggle instagram', () => {
    let homePage, helper;

    beforeAll(() => {
        homePage = new HomePage();
        helper = new Helper();
        return homePage.visit();
    });

    it('should scroll to the page bottom', () => {
        homePage.scrollToBottom();
    });

    it('should go to Wiggle Instagram account', () => {
        helper.focusAndClick(homePage.footer.instagramLink);
        expect(homePage.checkPageURL('https://www.instagram.com/wiggle_sport/')).to.eventually.be.true;
    })
});