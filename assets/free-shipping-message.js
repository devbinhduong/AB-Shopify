class FreeShippingMeter extends HTMLElement {
    constructor() {
        super();
    }

    static freeShippingText = window.free_shipping_text.free_shipping_message;
    static freeShippingText1 = window.free_shipping_text.free_shipping_message_1;
    static freeShippingText2 = window.free_shipping_text.free_shipping_message_2;
    static freeShippingText3 = window.free_shipping_text.free_shipping_message_3;
    static freeShippingText4 = window.free_shipping_text.free_shipping_message_4;
    static classLabel1 = 'progress-30';
    static classLabel2 = 'progress-60';
    static classLabel3 = 'progress-100';
    static freeshipPrice = parseInt(window.free_shipping_price);
    static priceRequired1 = parseInt(window.free_shipping_price_1);
    static priceRequired2 = parseInt(window.free_shipping_price_2);

    connectedCallback() {
        this.freeShippingEligible = 0;
        this.progressBar = this.querySelector('[data-shipping-progress]');
        this.progressBar2 = this.querySelector('[data-shipping-progress-2]');
        this.messageElement = this.querySelector('[data-shipping-message]');
        this.textEnabled = this.progressBar?.dataset.textEnabled === 'true';
        this.shipVal = window.free_shipping_text.free_shipping_1;
        this.progressMeter1 = this.querySelector('[data-free-shipping-progress-meter-1]');
        this.progressMeter2 = this.querySelector('[data-free-shipping-progress-meter-2]');

        this.addEventListener('change', this.onCartChange.bind(this));

        this.initialize();
    }

    initialize() {
        Shopify.getCart((cart) => {
            this.cart = cart;
            this.calculateProgress(cart);
        })
    }

    onCartChange(e) {
        this.initialize();
    }

    calculateProgress(cart) {
        let totalPrice = cart.total_price;
        if ($('body').hasClass('setup_shipping_delivery')) {
            const giftCardItems = $(".cart-item[data-price-gift-card], .previewCartItem[data-price-gift-card]");
            if (giftCardItems.length > 0) {
                giftCardItems.each(function() {
                    totalPrice -= parseFloat($(this).attr("data-price-gift-card"));
                });
            }
        }
        const cartTotalPrice = parseInt(totalPrice) / 100;
        const cartTotalPriceFormatted = cartTotalPrice.toFixed(2);
        const cartTotalPriceRounded = parseFloat(cartTotalPriceFormatted);

        let freeShipBar = Math.abs((cartTotalPriceRounded * 100) / FreeShippingMeter.freeshipPrice);
        let freeShipBar1 = Math.abs((cartTotalPriceRounded * 100) / FreeShippingMeter.priceRequired1);
        
        let freeShipBar2 = 0;


        if (freeShipBar >= 100) {
            freeShipBar = 100;
        }

        if (freeShipBar1 >= 100) {
            freeShipBar1 = 100;

            freeShipBar2 = Math.abs(((cartTotalPriceRounded - FreeShippingMeter.priceRequired1) * 100) / FreeShippingMeter.priceRequired2);

            if (freeShipBar2 >= 100) {
                freeShipBar2 = 100;
            }
        }


        console.log(`Free Shipping Bar: ${freeShipBar1}% | Free Shipping Price: ${FreeShippingMeter.priceRequired1} | Cart Total Price: ${cartTotalPriceFormatted}`);
        
        console.log(`Free Shipping Bar 2: ${freeShipBar2}% | Free Shipping Price 2: ${FreeShippingMeter.priceRequired2} | Cart Total Price: ${cartTotalPriceFormatted}`);
        
        const text = this.getText(cartTotalPriceFormatted, freeShipBar);
        const classLabel1 = this.getClassLabel(freeShipBar1);
        const classLabel2 = this.getClassLabel(freeShipBar2);

        this.setProgressWidthAndText(freeShipBar1, freeShipBar2, text, classLabel1, classLabel2);
    }

    getText(cartTotalPrice, freeShipBar) {
        let text;

        if (cartTotalPrice == 0) {
            text = '<span>' + FreeShippingMeter.freeShippingText + ' ' + Shopify.formatMoney(FreeShippingMeter.freeshipPrice * 100, window.money_format) +'!</span>';
        } else if (cartTotalPrice >= FreeShippingMeter.freeshipPrice) {
            this.freeShippingEligible = 1;
            text = FreeShippingMeter.freeShippingText1;
        } else {
            const remainingPrice = Math.abs(FreeShippingMeter.freeshipPrice - cartTotalPrice);
            text = '<span>' + FreeShippingMeter.freeShippingText2 + ' </span>' + Shopify.formatMoney(remainingPrice * 100, window.money_format) + '<span> ' +  FreeShippingMeter.freeShippingText3 + ' </span><span class="text">' + FreeShippingMeter.freeShippingText4 + '</span>';
            this.shipVal = window.free_shipping_text.free_shipping_2;
        }

        return text;
    }

    getClassLabel(freeShipBar) {
        let classLabel;

        if (freeShipBar === 0) {
            classLabel = 'none';
        } else if (freeShipBar <= 30) {
            classLabel = FreeShippingMeter.classLabel1;
        } else  if (freeShipBar <= 60) {
            classLabel = FreeShippingMeter.classLabel2;
        } else if (freeShipBar < 100) {
            classLabel = FreeShippingMeter.classLabel3;
        } else {
            classLabel = 'progress-free'
        }

        return classLabel;
    }
    
    resetProgressClass(classLabel1, classLabel2) {
        this.progressBar.classList.remove('progress-30');
        this.progressBar.classList.remove('progress-60');
        this.progressBar.classList.remove('progress-100');
        this.progressBar.classList.remove('progress-free');

        this.progressBar2.classList.remove('progress-30');
        this.progressBar2.classList.remove('progress-60');
        this.progressBar2.classList.remove('progress-100');
        this.progressBar2.classList.remove('progress-free');

        this.progressBar.classList.add(classLabel1);
        this.progressBar2.classList.add(classLabel2);

        console.log(`Progress Class 1: ${classLabel1}, Progress Class 2: ${classLabel2}`);
        
    }
    
    setProgressWidthAndText(freeShipBar1, freeShipBar2, text, classLabel1, classLabel2) {
        setTimeout(() => {
            this.resetProgressClass(classLabel1, classLabel2);

            this.progressMeter1.style.width = `${freeShipBar1}%`;
            this.progressMeter2.style.width = `${freeShipBar2}%`;
            if (this.textEnabled) {
                const textWrapper = this.progressMeter1.querySelector('.text').innerHTML = `${freeShipBar1.toFixed(2)}%`;
            }

            this.messageElement.innerHTML = text;

            if ((window.show_multiple_currencies && typeof Currency != 'undefined' && Currency.currentCurrency != shopCurrency) || window.show_auto_currency) {
                Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
            }
        }, 400)
    }
}

window.addEventListener('load', () => {
    customElements.define('free-shipping-component', FreeShippingMeter);
})