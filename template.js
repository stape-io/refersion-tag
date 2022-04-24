const sendHttpRequest = require('sendHttpRequest');
const setCookie = require('setCookie');
const parseUrl = require('parseUrl');
const JSON = require('JSON');
const getRequestHeader = require('getRequestHeader');
const getCookieValues = require('getCookieValues');
const getEventData = require('getEventData');
const getAllEventData = require('getAllEventData');
const logToConsole = require('logToConsole');
const getContainerVersion = require('getContainerVersion');
const containerVersion = getContainerVersion();
const isDebug = containerVersion.debugMode;
const isLoggingEnabled = determinateIsLoggingEnabled();
const traceId = getRequestHeader('trace-id');
const eventData = getAllEventData();

if (data.type === 'page_view') {
    const url = getEventData('page_location') || getRequestHeader('referer');

    if (url) {
        const value = parseUrl(url).searchParams.rfsn;

        if (value) {
            const options = {
                domain: 'auto',
                path: '/',
                secure: true,
                httpOnly: false
            };

            if (data.expiration > 0) options['max-age'] = data.expiration;

            setCookie('refersion_rfsn', value, options, false);
        }
    }

    data.gtmOnSuccess();
} else {
    let rfsn = getCookieValues('refersion_rfsn')[0] || '';
    let requestUrl = 'https://inbound-webhooks.refersion.com/tracker/orders/paid';
    let requestBody = {
        'cart_id': data.orderId,
        'auto_credit_affiliate_id': rfsn.split('.')[0],
        'order_id': data.orderId,
        'currency_code': data.currencyCode,
        'customer': getCustomerData(),
        'items': data.items ? data.items : getItems(),
    };

    if (data.shipping) requestBody.shipping = data.shipping;
    if (data.tax) requestBody.tax = data.tax;
    if (data.discount) requestBody.discount = data.discount;
    if (data.discountCode) requestBody['discount_code'] = data.discountCode;

    if (data.isSubscription) {
        requestBody.is_subscription = true;
        requestBody.subscription_id = data.subscriptionId;
    }

    if (isLoggingEnabled) {
        logToConsole(JSON.stringify({
            'Name': 'Refersion',
            'Type': 'Request',
            'TraceId': traceId,
            'EventName': 'Conversion',
            'RequestMethod': 'POST',
            'RequestUrl': requestUrl,
            'RequestBody': requestBody,
        }));
    }

    sendHttpRequest(requestUrl, (statusCode, headers, body) => {
        if (isLoggingEnabled) {
            logToConsole(JSON.stringify({
                'Name': 'Refersion',
                'Type': 'Response',
                'TraceId': traceId,
                'EventName': 'Conversion',
                'ResponseStatusCode': statusCode,
                'ResponseHeaders': headers,
                'ResponseBody': body,
            }));
        }

        if (statusCode >= 200 && statusCode < 300) {
            data.gtmOnSuccess();
        } else {
            data.gtmOnFailure();
        }
    }, {method: 'POST', headers: {'Content-Type': 'application/json', 'Refersion-Public-Key': data.publicKey, 'Refersion-Secret-Key': data.secretKey}}, JSON.stringify(requestBody));
}

function getCustomerData() {
    let customer = {
        ip_address: eventData.ip_override,
    };

    if (eventData.email) customer.email = eventData.email;
    else if (eventData.user_data && eventData.user_data.email_address) customer.email = eventData.user_data.email_address;

    if (eventData.lastName) customer.last_name = eventData.lastName;
    else if (eventData.LastName) customer.last_name = eventData.LastName;
    else if (eventData.nameLast) customer.last_name = eventData.nameLast;
    else if (eventData.user_data && eventData.user_data.address && eventData.user_data.address.last_name) customer.last_name = eventData.user_data.address.last_name;

    if (eventData.firstName) customer.first_name = eventData.firstName;
    else if (eventData.FirstName) customer.first_name = eventData.FirstName;
    else if (eventData.nameFirst) customer.first_name = eventData.nameFirst;
    else if (eventData.user_data && eventData.user_data.address && eventData.user_data.address.first_name) customer.first_name = eventData.user_data.address.first_name;

    if (data.userDataList) {
        data.userDataList.forEach(d => {
            customer[d.name] = d.value;
        });
    }

    return customer;
}

function getItems() {
    let items = [];

    if (eventData.items && eventData.items[0]) {
        eventData.items.forEach((d,i) => {
            let item = {};

            if (d.name) item.name = d.name || d.item_name || d.title;
            if (d.sku) item.sku = d.sku || d.item_sku || d.item_id || d.id;
            if (d.quantity) item.quantity = d.quantity || d.item_quantity || d.qty;
            if (d.price) item.price = d.price || d.item_price;

            items.push(item);
        });
    }

    return items;
}

function determinateIsLoggingEnabled() {
    if (!data.logType) {
        return isDebug;
    }

    if (data.logType === 'no') {
        return false;
    }

    if (data.logType === 'debug') {
        return isDebug;
    }

    return data.logType === 'always';
}
