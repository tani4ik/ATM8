const ProductPage = require('./../po/productPage'),
    BasketPage = require('./../po/basketPage');
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

describe ('Add product to basket and change currency', () => {
    let productPage, basketPage, helper;
    
    beforeAll(() => {
        productPage = new ProductPage();
        basketPage = new BasketPage();
        helper = new Helper();
        return productPage.visit();
    });

    it('should select colour and size options', () => {
        productPage.selectColourAndSizeOptions();
    });

    it('should add product to basket', () => {
        helper.waitForVisibilityOf(productPage.addToBasket, 5000);
        productPage.addItemToBasket();
    })

    it('should go to Basket page', () => {
        basketPage.visit();
        expect(basketPage.itemName.getText()).to.eventually.be.equal('LittleLife Toddler Animal Daysack');
    })

    it('should change currency to Euro', () => {
        basketPage.changeCurrencyToEuro();
        expect(basketPage.itemsSubtotal.getText()).to.eventually.include('€');
    })
    
});