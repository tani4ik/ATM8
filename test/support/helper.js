class Helper {

    clickToElement(element) {
        return element.click();
    }

    setElementValue(element, value) {
        return element.sendKeys(value);
    }

    waitForVisibilityOf(element, timeout) {
        const timeoutMs = timeout || browser.params.defaultTimeOut;
        return browser.wait(protractor.ExpectedConditions.visibilityOf(element), timeoutMs,
            `Waiting for visibilityOf of ${element.locator()} failed`);
    }

    setElementClear(element) {
        return element.clear();
    }

    getTextInputValue(element) {
        return element.getAttribute('value');
    }

    focusAndClick(element) {
        return browser.actions().mouseMove(element).perform().
            then(() => {
                return browser.actions().mouseDown(element).perform().
                then(() => {
                    return browser.actions().mouseUp(element).perform();
                })
            })
    }
}

module.exports = Helper;