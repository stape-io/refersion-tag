# Refersion tag for Google Tag Manager Server Side

Refersion s2s tag stores the rfsn URL parameter inside the refersion_rfsn cookie on a pageview event. When the Conversion Refersion tag triggers, it send a request with data about the conversion to the Refersion.

- `Public Key` - your refersion public key
- `Secret Key` - your refersion secret key
- `Currency Code` - three letter currency code of the order totals that you are reporting. Example: USD, CAD, GBP.
- `Order ID` - unique shopping cart order ID or transaction number used to reference the purchase that you're reporting.
- `Shipping` - total shipping and handling the customer was charged for the order.
- `Tax` - total tax the customer was charged for the order.
- `Discount` - total in discounts that were applied to the order.
- `Discount Code` - the discount or coupon code that was used on the order.
- `Is Subscription` - enable if order is subscription
- `Override items array` - by default items array generates from the Event Data items.
- `Customer Data` - set user data: first name, last name, email, IP adress

## How to use

- [How to set up Refersion tag using Google Tag Manager](https://stape.io/blog/how-to-set-up-refersion-tag-using-google-tag-manager)

## Open Source

Refersion Tag for GTM Server Side is developed and maintained by [Stape Team](https://stape.io/) under the Apache 2.0 license.
