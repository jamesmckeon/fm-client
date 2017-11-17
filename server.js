"use strict";

var express = require("express"),
    app = express();

const bodyParser = require("body-parser");
const compression = require('compression');
const r = require("request");
const https = require("https");
const rp = require("request-promise");

require('request-debug')(rp, function(type, data, r) {
    console.log(type + ": " + r.host);
});

const port = process.env.PORT || 8080;

app.use(compression());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var httpsClient = new httpsClient("https://www.fredmeyer.com", r.jar());
var krogerClient = new krogerClient(httpsClient);

var router = express.Router();
app.use('/store', router);

app.get('/store/authenticationState', function(req, res) {

    return krogerClient.checkAuthentication().then(function(response) {
        res.json(response);
    })
});

app.get('/store/google', function(req, res) {

    return rp('https://www.google.com')
        .then(function(htmlString) {
            res.send(htmlString);
        })
        .catch(function(err) {
            res.status(500).send();
        });

})

app.listen(port);

function krogerClient(httpsClient) {

    const urls = {
        base: "https://www.fredmeyer.com",
        getItem: "/storecatalog/clicklistbeta/api/items/upc/{0}",
        searchProducts: "/storecatalog/clicklistbeta/api/products?searchTerm={0}&categoryId=&categoryName=Search%20results&pageNumber=1&pageSize=100&sort=popularity",
        clicklist: "/storecatalog/clicklistbeta",
        authenticate: "/user/authenticate",
        favorites: "/storecatalog/clicklistbeta/api/items/personalized/myFavorites",
        recentPurchases: "/storecatalog/clicklistbeta/api/items/personalized/recentPurchases/quick",
        cart: "/storecatalog/clicklistbeta/api/cart",
        cartItem: "/storecatalog/clicklistbeta/api/cart/item",
        removeFromCart: "/storecatalog/clicklistbeta/api/cart/item?strategy=deleteItem",
        storeSetup: "/storecatalog/servlet/OnlineShoppingStoreSetup",
        // as of 9/4/2017, the xsrf token isn't returned until this URL is pinged, returning
        //HTTP result 302
        xsrfSetter: "products/api/toggles",
        pickupsAvailable: "storecatalog/clicklistbeta/api/store/timeslot/available/pickup",
        pickupsEarliest: "storecatalog/clicklistbeta/api/store/timeslot/earliest/pickup",
        pickupsCurrent: "storecatalog/clicklistbeta/api/store/timeslot",
        orders: "storecatalog/clicklistbeta/api/order/history",
        cancelOrder: "storecatalog/clicklistbeta/api/order/{0}/{1}/delete",
        modifiableOrder: "storecatalog/clicklistbeta/api/order/modifiable",
        startCheckout: "storecatalog/clicklistbeta/api/payment/submit",
        pickupReserve: "storecatalog/clicklistbeta/api/store/timeslot/reserve",
        authenticationState: "user/getAuthenticationState"
    };

    function checkAuthentication() {
        return httpsClient.get(urls.authenticationState).then(function(response) {
            return response.body;
        })
    }

    return {
        checkAuthentication: checkAuthentication
    }

};

function httpsClient(baseUrl, cookieJar) {

    function getOptions(url) {
        return {
            url: url,
            // simple: false,
            //resolveWithFullResponse: true,
            baseUrl: baseUrl,
            method: "get",
            jar: true
                //gzip: true,
                //jar: cookieJar,
                //timeout: 15000
                //,
                // headers: {
                //    Accept: "application/json, text/plain, */*",
                //     Origin: baseUrl,
                //     "Content-Type": "application/json;charset=UTF-8"
                // }
        }
    }

    return {
        get: function(url) {

            var options = getOptions(url);

            return rp(options);
        }
    }
}