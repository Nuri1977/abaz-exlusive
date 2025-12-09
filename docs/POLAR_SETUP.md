# Create Checkout Session

> Create a checkout session.

**Scopes**: `checkouts:write`

## OpenAPI

```yaml post /v1/checkouts/
paths:
  path: /v1/checkouts/
  method: post
  servers:
    - url: https://api.polar.sh
      description: Production environment
    - url: https://sandbox-api.polar.sh
      description: Sandbox environment
  request:
    security:
      - title: access token
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                You can generate an **Organization Access Token** from your
                organization's settings.
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              trial_interval:
                allOf:
                  - anyOf:
                      - $ref: "#/components/schemas/TrialInterval"
                      - type: "null"
                    description: The interval unit for the trial period.
              trial_interval_count:
                allOf:
                  - anyOf:
                      - type: integer
                        maximum: 1000
                        minimum: 1
                      - type: "null"
                    title: Trial Interval Count
                    description: The number of interval units for the trial period.
              metadata:
                allOf:
                  - additionalProperties:
                      anyOf:
                        - type: string
                          maxLength: 500
                          minLength: 1
                        - type: integer
                        - type: number
                        - type: boolean
                    propertyNames:
                      maxLength: 40
                      minLength: 1
                    type: object
                    maxProperties: 50
                    title: Metadata
                    description: >-
                      Key-value object allowing you to store additional
                      information.


                      The key must be a string with a maximum length of **40
                      characters**.

                      The value must be either:


                      * A string with a maximum length of **500 characters**

                      * An integer

                      * A floating-point number

                      * A boolean


                      You can store up to **50 key-value pairs**.
              custom_field_data:
                allOf:
                  - additionalProperties:
                      anyOf:
                        - type: string
                        - type: integer
                        - type: boolean
                        - type: string
                          format: date-time
                        - type: "null"
                    type: object
                    title: Custom Field Data
                    description: Key-value object storing custom field values.
              discount_id:
                allOf:
                  - anyOf:
                      - type: string
                        format: uuid4
                      - type: "null"
                    title: Discount Id
                    description: ID of the discount to apply to the checkout.
              allow_discount_codes:
                allOf:
                  - type: boolean
                    title: Allow Discount Codes
                    description: >-
                      Whether to allow the customer to apply discount codes. If
                      you apply a discount through `discount_id`, it'll still be
                      applied, but the customer won't be able to change it.
                    default: true
              require_billing_address:
                allOf:
                  - type: boolean
                    title: Require Billing Address
                    description: >-
                      Whether to require the customer to fill their full billing
                      address, instead of just the country. Customers in the US
                      will always be required to fill their full address,
                      regardless of this setting. If you preset the billing
                      address, this setting will be automatically set to `true`.
                    default: false
              amount:
                allOf:
                  - anyOf:
                      - type: integer
                        maximum: 99999999
                        minimum: 50
                        description: >-
                          Amount in cents, before discounts and taxes. Only
                          useful for custom prices, it'll be ignored for fixed
                          and free prices.
                      - type: "null"
                    title: Amount
              seats:
                allOf:
                  - anyOf:
                      - type: integer
                        maximum: 1000
                        minimum: 1
                      - type: "null"
                    title: Seats
                    description: >-
                      Number of seats for seat-based pricing. Required for
                      seat-based products.
              allow_trial:
                allOf:
                  - type: boolean
                    title: Allow Trial
                    description: >-
                      Whether to enable the trial period for the checkout
                      session. If `false`, the trial period will be disabled,
                      even if the selected product has a trial configured.
                    default: true
              customer_id:
                allOf:
                  - anyOf:
                      - type: string
                        format: uuid4
                      - type: "null"
                    title: Customer Id
                    description: >-
                      ID of an existing customer in the organization. The
                      customer data will be pre-filled in the checkout form. The
                      resulting order will be linked to this customer.
              is_business_customer:
                allOf:
                  - type: boolean
                    title: Is Business Customer
                    description: >-
                      Whether the customer is a business or an individual. If
                      `true`, the customer will be required to fill their full
                      billing address and billing name.
                    default: false
              external_customer_id:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: External Customer Id
                    description: >-
                      ID of the customer in your system. If a matching customer
                      exists on Polar, the resulting order will be linked to
                      this customer. Otherwise, a new customer will be created
                      with this external ID set.
              customer_name:
                allOf:
                  - anyOf:
                      - type: string
                        maxLength: 256
                        description: The name of the customer.
                        examples:
                          - John Doe
                      - type: "null"
                    title: Customer Name
              customer_email:
                allOf:
                  - anyOf:
                      - type: string
                        format: email
                        description: Email address of the customer.
                      - type: "null"
                    title: Customer Email
              customer_ip_address:
                allOf:
                  - anyOf:
                      - type: string
                        format: ipvanyaddress
                      - type: "null"
                    title: Customer Ip Address
              customer_billing_name:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: Customer Billing Name
              customer_billing_address:
                allOf:
                  - anyOf:
                      - $ref: "#/components/schemas/AddressInput"
                        description: Billing address of the customer.
                      - type: "null"
              customer_tax_id:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: Customer Tax Id
              customer_metadata:
                allOf:
                  - additionalProperties:
                      anyOf:
                        - type: string
                          maxLength: 500
                          minLength: 1
                        - type: integer
                        - type: number
                        - type: boolean
                    propertyNames:
                      maxLength: 40
                      minLength: 1
                    type: object
                    maxProperties: 50
                    title: Customer Metadata
                    description: >-
                      Key-value object allowing you to store additional
                      information that'll be copied to the created customer.


                      The key must be a string with a maximum length of **40
                      characters**.

                      The value must be either:


                      * A string with a maximum length of **500 characters**

                      * An integer

                      * A floating-point number

                      * A boolean


                      You can store up to **50 key-value pairs**.
              subscription_id:
                allOf:
                  - anyOf:
                      - type: string
                        format: uuid4
                      - type: "null"
                    title: Subscription Id
                    description: >-
                      ID of a subscription to upgrade. It must be on a free
                      pricing. If checkout is successful, metadata set on this
                      checkout will be copied to the subscription, and existing
                      keys will be overwritten.
              success_url:
                allOf:
                  - anyOf:
                      - type: string
                        maxLength: 2083
                        minLength: 1
                        format: uri
                      - type: "null"
                    title: Success Url
                    description: >-
                      URL where the customer will be redirected after a
                      successful payment.You can add the
                      `checkout_id={CHECKOUT_ID}` query parameter to retrieve
                      the checkout session id.
              return_url:
                allOf:
                  - anyOf:
                      - type: string
                        maxLength: 2083
                        minLength: 1
                        format: uri
                      - type: "null"
                    title: Return Url
                    description: >-
                      When set, a back button will be shown in the checkout to
                      return to this URL.
              embed_origin:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: Embed Origin
                    description: >-
                      If you plan to embed the checkout session, set this to the
                      Origin of the embedding page. It'll allow the Polar iframe
                      to communicate with the parent page.
              products:
                allOf:
                  - items:
                      type: string
                      format: uuid4
                    type: array
                    minItems: 1
                    title: Products
                    description: >-
                      List of product IDs available to select at that checkout.
                      The first one will be selected by default.
              prices:
                allOf:
                  - anyOf:
                      - additionalProperties:
                          items:
                            oneOf:
                              - $ref: "#/components/schemas/ProductPriceFixedCreate"
                              - $ref: "#/components/schemas/ProductPriceCustomCreate"
                              - $ref: "#/components/schemas/ProductPriceFreeCreate"
                              - $ref: >-
                                  #/components/schemas/ProductPriceSeatBasedCreate
                              - $ref: >-
                                  #/components/schemas/ProductPriceMeteredUnitCreate
                            discriminator:
                              propertyName: amount_type
                              mapping:
                                custom: "#/components/schemas/ProductPriceCustomCreate"
                                fixed: "#/components/schemas/ProductPriceFixedCreate"
                                free: "#/components/schemas/ProductPriceFreeCreate"
                                metered_unit: >-
                                  #/components/schemas/ProductPriceMeteredUnitCreate
                                seat_based: >-
                                  #/components/schemas/ProductPriceSeatBasedCreate
                          type: array
                          minItems: 1
                          description: >-
                            List of prices for the product. At most one static
                            price (fixed, custom or free) is allowed. Any number
                            of metered prices can be added.
                        propertyNames:
                          format: uuid4
                        type: object
                      - type: "null"
                    title: Prices
                    description: >-
                      Optional mapping of product IDs to a list of ad-hoc prices
                      to create for that product. If not set, catalog prices of
                      the product will be used.
            required: true
            title: CheckoutProductsCreate
            description: |-
              Create a new checkout session from a list of products.
              Customers will be able to switch between those products.

              Metadata set on the checkout will be copied
              to the resulting order and/or subscription.
            refIdentifier: "#/components/schemas/CheckoutCreate"
            requiredProperties:
              - products
        examples:
          example:
            value:
              trial_interval: day
              trial_interval_count: 500
              metadata: {}
              custom_field_data: {}
              discount_id: <string>
              allow_discount_codes: true
              require_billing_address: false
              amount: 50000024
              seats: 500
              allow_trial: true
              customer_id: <string>
              is_business_customer: false
              external_customer_id: <string>
              customer_name: John Doe
              customer_email: jsmith@example.com
              customer_ip_address: <string>
              customer_billing_name: <string>
              customer_billing_address:
                line1: <string>
                line2: <string>
                postal_code: <string>
                city: <string>
                state: <string>
                country: US
              customer_tax_id: <string>
              customer_metadata: {}
              subscription_id: <string>
              success_url: <string>
              return_url: <string>
              embed_origin: <string>
              products:
                - <string>
              prices: {}
    codeSamples:
      - label: Go (SDK)
        lang: go
        source: "package main\n\nimport(\n\t\"context\"\n\t\"os\"\n\tpolargo \"github.com/polarsource/polar-go\"\n\t\"github.com/polarsource/polar-go/models/components\"\n\t\"log\"\n)\n\nfunc main() {\n    ctx := context.Background()\n\n    s := polargo.New(\n        polargo.WithSecurity(os.Getenv(\"POLAR_ACCESS_TOKEN\")),\n    )\n\n    res, err := s.Checkouts.Create(ctx, components.CheckoutCreate{\n        CustomerName: polargo.Pointer(\"John Doe\"),\n        CustomerBillingAddress: &components.AddressInput{\n            Country: components.CountryAlpha2InputUs,\n        },\n        Products: []string{\n            \"<value 1>\",\n            \"<value 2>\",\n            \"<value 3>\",\n        },\n    })\n    if err != nil {\n        log.Fatal(err)\n    }\n    if res.Checkout != nil {\n        // handle response\n    }\n}"
      - label: Python (SDK)
        lang: python
        source: |-
          import polar_sdk
          from polar_sdk import Polar


          with Polar(
              access_token="<YOUR_BEARER_TOKEN_HERE>",
          ) as polar:

              res = polar.checkouts.create(request={
                  "customer_name": "John Doe",
                  "customer_billing_address": {
                      "country": polar_sdk.CountryAlpha2Input.US,
                  },
                  "products": [
                      "<value 1>",
                      "<value 2>",
                      "<value 3>",
                  ],
              })

              # Handle response
              print(res)
      - label: Typescript (SDK)
        lang: typescript
        source: |-
          import { Polar } from "@polar-sh/sdk";

          const polar = new Polar({
            accessToken: process.env["POLAR_ACCESS_TOKEN"] ?? "",
          });

          async function run() {
            const result = await polar.checkouts.create({
              customerName: "John Doe",
              customerBillingAddress: {
                country: "US",
              },
              products: [
                "<value 1>",
                "<value 2>",
                "<value 3>",
              ],
            });

            console.log(result);
          }

          run();
      - label: PHP (SDK)
        lang: php
        source: |-
          declare(strict_types=1);

          require 'vendor/autoload.php';

          use Polar;
          use Polar\Models\Components;

          $sdk = Polar\Polar::builder()
              ->setSecurity(
                  '<YOUR_BEARER_TOKEN_HERE>'
              )
              ->build();

          $request = new Components\CheckoutCreate(
              customerName: 'John Doe',
              customerBillingAddress: new Components\AddressInput(
                  country: Components\CountryAlpha2Input::Us,
              ),
              products: [
                  '<value 1>',
                  '<value 2>',
                  '<value 3>',
              ],
          );

          $response = $sdk->checkouts->create(
              request: $request
          );

          if ($response->checkout !== null) {
              // handle response
          }
  response:
    "201":
      application/json:
        schemaArray:
          - type: object
            properties:
              id:
                allOf:
                  - type: string
                    format: uuid4
                    title: Id
                    description: The ID of the object.
              created_at:
                allOf:
                  - type: string
                    format: date-time
                    title: Created At
                    description: Creation timestamp of the object.
              modified_at:
                allOf:
                  - anyOf:
                      - type: string
                        format: date-time
                      - type: "null"
                    title: Modified At
                    description: Last modification timestamp of the object.
              custom_field_data:
                allOf:
                  - additionalProperties:
                      anyOf:
                        - type: string
                        - type: integer
                        - type: boolean
                        - type: string
                          format: date-time
                        - type: "null"
                    type: object
                    title: Custom Field Data
                    description: Key-value object storing custom field values.
              payment_processor:
                allOf:
                  - $ref: "#/components/schemas/PaymentProcessor"
                    description: Payment processor used.
              status:
                allOf:
                  - $ref: "#/components/schemas/CheckoutStatus"
                    description: |2-

                              Status of the checkout session.

                              - Open: the checkout session was opened.
                              - Expired: the checkout session was expired and is no more accessible.
                              - Confirmed: the user on the checkout session clicked Pay. This is not indicative of the payment's success status.
                              - Failed: the checkout definitely failed for technical reasons and cannot be retried. In most cases, this state is never reached.
                              - Succeeded: the payment on the checkout was performed successfully.

              client_secret:
                allOf:
                  - type: string
                    title: Client Secret
                    description: >-
                      Client secret used to update and complete the checkout
                      session from the client.
              url:
                allOf:
                  - type: string
                    title: Url
                    description: URL where the customer can access the checkout session.
              expires_at:
                allOf:
                  - type: string
                    format: date-time
                    title: Expires At
                    description: Expiration date and time of the checkout session.
              success_url:
                allOf:
                  - type: string
                    title: Success Url
                    description: >-
                      URL where the customer will be redirected after a
                      successful payment.
              return_url:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: Return Url
                    description: >-
                      When set, a back button will be shown in the checkout to
                      return to this URL.
              embed_origin:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: Embed Origin
                    description: >-
                      When checkout is embedded, represents the Origin of the
                      page embedding the checkout. Used as a security measure to
                      send messages only to the embedding page.
              amount:
                allOf:
                  - type: integer
                    title: Amount
                    description: Amount in cents, before discounts and taxes.
              seats:
                allOf:
                  - anyOf:
                      - type: integer
                      - type: "null"
                    title: Seats
                    description: Number of seats for seat-based pricing.
              price_per_seat:
                allOf:
                  - anyOf:
                      - type: integer
                      - type: "null"
                    title: Price Per Seat
                    description: >-
                      Price per seat in cents for the current seat count, based
                      on the applicable tier. Only relevant for seat-based
                      pricing.
              discount_amount:
                allOf:
                  - type: integer
                    title: Discount Amount
                    description: Discount amount in cents.
              net_amount:
                allOf:
                  - type: integer
                    title: Net Amount
                    description: Amount in cents, after discounts but before taxes.
              tax_amount:
                allOf:
                  - anyOf:
                      - type: integer
                      - type: "null"
                    title: Tax Amount
                    description: >-
                      Sales tax amount in cents. If `null`, it means there is no
                      enough information yet to calculate it.
              total_amount:
                allOf:
                  - type: integer
                    title: Total Amount
                    description: Amount in cents, after discounts and taxes.
              currency:
                allOf:
                  - type: string
                    title: Currency
                    description: Currency code of the checkout session.
              allow_trial:
                allOf:
                  - anyOf:
                      - type: boolean
                      - type: "null"
                    title: Allow Trial
                    description: >-
                      Whether to enable the trial period for the checkout
                      session. If `false`, the trial period will be disabled,
                      even if the selected product has a trial configured.
              active_trial_interval:
                allOf:
                  - anyOf:
                      - $ref: "#/components/schemas/TrialInterval"
                      - type: "null"
                    description: >-
                      Interval unit of the trial period, if any. This value is
                      either set from the checkout, if `trial_interval` is set,
                      or from the selected product.
              active_trial_interval_count:
                allOf:
                  - anyOf:
                      - type: integer
                      - type: "null"
                    title: Active Trial Interval Count
                    description: >-
                      Number of interval units of the trial period, if any. This
                      value is either set from the checkout, if
                      `trial_interval_count` is set, or from the selected
                      product.
              trial_end:
                allOf:
                  - anyOf:
                      - type: string
                        format: date-time
                      - type: "null"
                    title: Trial End
                    description: End date and time of the trial period, if any.
              organization_id:
                allOf:
                  - type: string
                    format: uuid4
                    title: Organization Id
                    description: ID of the organization owning the checkout session.
              product_id:
                allOf:
                  - anyOf:
                      - type: string
                        format: uuid4
                      - type: "null"
                    title: Product Id
                    description: ID of the product to checkout.
              product_price_id:
                allOf:
                  - anyOf:
                      - type: string
                        format: uuid4
                      - type: "null"
                    title: Product Price Id
                    description: ID of the product price to checkout.
                    deprecated: true
              discount_id:
                allOf:
                  - anyOf:
                      - type: string
                        format: uuid4
                      - type: "null"
                    title: Discount Id
                    description: ID of the discount applied to the checkout.
              allow_discount_codes:
                allOf:
                  - type: boolean
                    title: Allow Discount Codes
                    description: >-
                      Whether to allow the customer to apply discount codes. If
                      you apply a discount through `discount_id`, it'll still be
                      applied, but the customer won't be able to change it.
              require_billing_address:
                allOf:
                  - type: boolean
                    title: Require Billing Address
                    description: >-
                      Whether to require the customer to fill their full billing
                      address, instead of just the country. Customers in the US
                      will always be required to fill their full address,
                      regardless of this setting. If you preset the billing
                      address, this setting will be automatically set to `true`.
              is_discount_applicable:
                allOf:
                  - type: boolean
                    title: Is Discount Applicable
                    description: >-
                      Whether the discount is applicable to the checkout.
                      Typically, free and custom prices are not discountable.
              is_free_product_price:
                allOf:
                  - type: boolean
                    title: Is Free Product Price
                    description: >-
                      Whether the product price is free, regardless of
                      discounts.
              is_payment_required:
                allOf:
                  - type: boolean
                    title: Is Payment Required
                    description: >-
                      Whether the checkout requires payment, e.g. in case of
                      free products or discounts that cover the total amount.
              is_payment_setup_required:
                allOf:
                  - type: boolean
                    title: Is Payment Setup Required
                    description: >-
                      Whether the checkout requires setting up a payment method,
                      regardless of the amount, e.g. subscriptions that have
                      first free cycles.
              is_payment_form_required:
                allOf:
                  - type: boolean
                    title: Is Payment Form Required
                    description: >-
                      Whether the checkout requires a payment form, whether
                      because of a payment or payment method setup.
              customer_id:
                allOf:
                  - anyOf:
                      - type: string
                        format: uuid4
                      - type: "null"
                    title: Customer Id
              is_business_customer:
                allOf:
                  - type: boolean
                    title: Is Business Customer
                    description: >-
                      Whether the customer is a business or an individual. If
                      `true`, the customer will be required to fill their full
                      billing address and billing name.
              customer_name:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: Customer Name
                    description: Name of the customer.
              customer_email:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: Customer Email
                    description: Email address of the customer.
              customer_ip_address:
                allOf:
                  - anyOf:
                      - type: string
                        format: ipvanyaddress
                      - type: "null"
                    title: Customer Ip Address
              customer_billing_name:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: Customer Billing Name
              customer_billing_address:
                allOf:
                  - anyOf:
                      - $ref: "#/components/schemas/Address"
                        description: Billing address of the customer.
                      - type: "null"
              customer_tax_id:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: Customer Tax Id
              payment_processor_metadata:
                allOf:
                  - additionalProperties:
                      type: string
                    type: object
                    title: Payment Processor Metadata
              billing_address_fields:
                allOf:
                  - $ref: "#/components/schemas/CheckoutBillingAddressFields"
                    description: >-
                      Determine which billing address fields should be disabled,
                      optional or required in the checkout form.
              trial_interval:
                allOf:
                  - anyOf:
                      - $ref: "#/components/schemas/TrialInterval"
                      - type: "null"
                    description: The interval unit for the trial period.
              trial_interval_count:
                allOf:
                  - anyOf:
                      - type: integer
                      - type: "null"
                    title: Trial Interval Count
                    description: The number of interval units for the trial period.
              metadata:
                allOf:
                  - additionalProperties:
                      anyOf:
                        - type: string
                        - type: integer
                        - type: number
                        - type: boolean
                    type: object
                    title: Metadata
              external_customer_id:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: External Customer Id
                    description: >-
                      ID of the customer in your system. If a matching customer
                      exists on Polar, the resulting order will be linked to
                      this customer. Otherwise, a new customer will be created
                      with this external ID set.
              customer_external_id:
                allOf:
                  - anyOf:
                      - type: string
                      - type: "null"
                    title: Customer External Id
                    deprecated: true
              products:
                allOf:
                  - items:
                      $ref: "#/components/schemas/CheckoutProduct"
                    type: array
                    title: Products
                    description: List of products available to select.
              product:
                allOf:
                  - anyOf:
                      - $ref: "#/components/schemas/CheckoutProduct"
                      - type: "null"
                    description: Product selected to checkout.
              product_price:
                allOf:
                  - anyOf:
                      - oneOf:
                          - $ref: "#/components/schemas/LegacyRecurringProductPrice"
                          - $ref: "#/components/schemas/ProductPrice"
                      - type: "null"
                    title: Product Price
                    description: Price of the selected product.
                    deprecated: true
              prices:
                allOf:
                  - anyOf:
                      - additionalProperties:
                          items:
                            oneOf:
                              - $ref: >-
                                  #/components/schemas/LegacyRecurringProductPrice
                              - $ref: "#/components/schemas/ProductPrice"
                          type: array
                          description: List of prices for this product.
                        propertyNames:
                          format: uuid4
                        type: object
                      - type: "null"
                    title: Prices
                    description: Mapping of product IDs to their list of prices.
              discount:
                allOf:
                  - anyOf:
                      - oneOf:
                          - $ref: >-
                              #/components/schemas/CheckoutDiscountFixedOnceForeverDuration
                          - $ref: >-
                              #/components/schemas/CheckoutDiscountFixedRepeatDuration
                          - $ref: >-
                              #/components/schemas/CheckoutDiscountPercentageOnceForeverDuration
                          - $ref: >-
                              #/components/schemas/CheckoutDiscountPercentageRepeatDuration
                      - type: "null"
                    title: Discount
              subscription_id:
                allOf:
                  - anyOf:
                      - type: string
                        format: uuid4
                      - type: "null"
                    title: Subscription Id
              attached_custom_fields:
                allOf:
                  - anyOf:
                      - items:
                          $ref: "#/components/schemas/AttachedCustomField"
                        type: array
                      - type: "null"
                    title: Attached Custom Fields
              customer_metadata:
                allOf:
                  - additionalProperties:
                      anyOf:
                        - type: string
                        - type: integer
                        - type: boolean
                    type: object
                    title: Customer Metadata
            title: Checkout
            description: Checkout session data retrieved using an access token.
            refIdentifier: "#/components/schemas/Checkout"
            requiredProperties:
              - id
              - created_at
              - modified_at
              - payment_processor
              - status
              - client_secret
              - url
              - expires_at
              - success_url
              - return_url
              - embed_origin
              - amount
              - discount_amount
              - net_amount
              - tax_amount
              - total_amount
              - currency
              - allow_trial
              - active_trial_interval
              - active_trial_interval_count
              - trial_end
              - organization_id
              - product_id
              - product_price_id
              - discount_id
              - allow_discount_codes
              - require_billing_address
              - is_discount_applicable
              - is_free_product_price
              - is_payment_required
              - is_payment_setup_required
              - is_payment_form_required
              - customer_id
              - is_business_customer
              - customer_name
              - customer_email
              - customer_ip_address
              - customer_billing_name
              - customer_billing_address
              - customer_tax_id
              - payment_processor_metadata
              - billing_address_fields
              - trial_interval
              - trial_interval_count
              - metadata
              - external_customer_id
              - customer_external_id
              - products
              - product
              - product_price
              - prices
              - discount
              - subscription_id
              - attached_custom_fields
              - customer_metadata
        examples:
          example:
            value:
              id: <string>
              created_at: "2023-11-07T05:31:56Z"
              modified_at: "2023-11-07T05:31:56Z"
              custom_field_data: {}
              payment_processor: stripe
              status: open
              client_secret: <string>
              url: <string>
              expires_at: "2023-11-07T05:31:56Z"
              success_url: <string>
              return_url: <string>
              embed_origin: <string>
              amount: 123
              seats: 123
              price_per_seat: 123
              discount_amount: 123
              net_amount: 123
              tax_amount: 123
              total_amount: 123
              currency: <string>
              allow_trial: true
              active_trial_interval: day
              active_trial_interval_count: 123
              trial_end: "2023-11-07T05:31:56Z"
              organization_id: <string>
              product_id: <string>
              product_price_id: <string>
              discount_id: <string>
              allow_discount_codes: true
              require_billing_address: true
              is_discount_applicable: true
              is_free_product_price: true
              is_payment_required: true
              is_payment_setup_required: true
              is_payment_form_required: true
              customer_id: <string>
              is_business_customer: true
              customer_name: <string>
              customer_email: <string>
              customer_ip_address: <string>
              customer_billing_name: <string>
              customer_billing_address:
                line1: <string>
                line2: <string>
                postal_code: <string>
                city: <string>
                state: <string>
                country: US
              customer_tax_id: <string>
              payment_processor_metadata: {}
              billing_address_fields:
                country: required
                state: required
                city: required
                postal_code: required
                line1: required
                line2: required
              trial_interval: day
              trial_interval_count: 123
              metadata: {}
              external_customer_id: <string>
              customer_external_id: <string>
              products:
                - id: <string>
                  created_at: "2023-11-07T05:31:56Z"
                  modified_at: "2023-11-07T05:31:56Z"
                  trial_interval: day
                  trial_interval_count: 123
                  name: <string>
                  description: <string>
                  recurring_interval: day
                  recurring_interval_count: 123
                  is_recurring: true
                  is_archived: true
                  organization_id: <string>
                  prices:
                    - created_at: "2023-11-07T05:31:56Z"
                      modified_at: "2023-11-07T05:31:56Z"
                      id: <string>
                      source: catalog
                      amount_type: <string>
                      is_archived: true
                      product_id: <string>
                      type: <string>
                      recurring_interval: day
                      price_currency: <string>
                      price_amount: 123
                      legacy: true
                  benefits:
                    - id: <string>
                      created_at: "2023-11-07T05:31:56Z"
                      modified_at: "2023-11-07T05:31:56Z"
                      type: custom
                      description: <string>
                      selectable: true
                      deletable: true
                      organization_id: <string>
                  medias:
                    - id: <string>
                      organization_id: <string>
                      name: <string>
                      path: <string>
                      mime_type: <string>
                      size: 123
                      storage_version: <string>
                      checksum_etag: <string>
                      checksum_sha256_base64: <string>
                      checksum_sha256_hex: <string>
                      last_modified_at: "2023-11-07T05:31:56Z"
                      version: <string>
                      service: <string>
                      is_uploaded: true
                      created_at: "2023-11-07T05:31:56Z"
                      size_readable: <string>
                      public_url: <string>
              product:
                id: <string>
                created_at: "2023-11-07T05:31:56Z"
                modified_at: "2023-11-07T05:31:56Z"
                trial_interval: day
                trial_interval_count: 123
                name: <string>
                description: <string>
                recurring_interval: day
                recurring_interval_count: 123
                is_recurring: true
                is_archived: true
                organization_id: <string>
                prices:
                  - created_at: "2023-11-07T05:31:56Z"
                    modified_at: "2023-11-07T05:31:56Z"
                    id: <string>
                    source: catalog
                    amount_type: <string>
                    is_archived: true
                    product_id: <string>
                    type: <string>
                    recurring_interval: day
                    price_currency: <string>
                    price_amount: 123
                    legacy: true
                benefits:
                  - id: <string>
                    created_at: "2023-11-07T05:31:56Z"
                    modified_at: "2023-11-07T05:31:56Z"
                    type: custom
                    description: <string>
                    selectable: true
                    deletable: true
                    organization_id: <string>
                medias:
                  - id: <string>
                    organization_id: <string>
                    name: <string>
                    path: <string>
                    mime_type: <string>
                    size: 123
                    storage_version: <string>
                    checksum_etag: <string>
                    checksum_sha256_base64: <string>
                    checksum_sha256_hex: <string>
                    last_modified_at: "2023-11-07T05:31:56Z"
                    version: <string>
                    service: <string>
                    is_uploaded: true
                    created_at: "2023-11-07T05:31:56Z"
                    size_readable: <string>
                    public_url: <string>
              product_price:
                created_at: "2023-11-07T05:31:56Z"
                modified_at: "2023-11-07T05:31:56Z"
                id: <string>
                source: catalog
                amount_type: <string>
                is_archived: true
                product_id: <string>
                type: <string>
                recurring_interval: day
                price_currency: <string>
                price_amount: 123
                legacy: true
              prices: {}
              discount:
                duration: once
                type: fixed
                amount: 1000
                currency: usd
                id: <string>
                name: <string>
                code: <string>
              subscription_id: <string>
              attached_custom_fields:
                - custom_field_id: <string>
                  custom_field:
                    created_at: "2023-11-07T05:31:56Z"
                    modified_at: "2023-11-07T05:31:56Z"
                    id: <string>
                    metadata: {}
                    type: <string>
                    slug: <string>
                    name: <string>
                    organization_id: 1dbfc517-0bbf-4301-9ba8-555ca42b9737
                    properties:
                      form_label: <string>
                      form_help_text: <string>
                      form_placeholder: <string>
                      textarea: true
                      min_length: 1
                      max_length: 1
                  order: 123
                  required: true
              customer_metadata: {}
        description: Checkout session created.
    "422":
      application/json:
        schemaArray:
          - type: object
            properties:
              detail:
                allOf:
                  - items:
                      $ref: "#/components/schemas/ValidationError"
                    type: array
                    title: Detail
            title: HTTPValidationError
            refIdentifier: "#/components/schemas/HTTPValidationError"
        examples:
          example:
            value:
              detail:
                - loc:
                    - <string>
                  msg: <string>
                  type: <string>
        description: Validation Error
  deprecated: false
  type: path
components:
  schemas:
    Address:
      properties:
        line1:
          anyOf:
            - type: string
            - type: "null"
          title: Line1
        line2:
          anyOf:
            - type: string
            - type: "null"
          title: Line2
        postal_code:
          anyOf:
            - type: string
            - type: "null"
          title: Postal Code
        city:
          anyOf:
            - type: string
            - type: "null"
          title: City
        state:
          anyOf:
            - type: string
            - type: "null"
          title: State
        country:
          type: string
          enum:
            - AD
            - AE
            - AF
            - AG
            - AI
            - AL
            - AM
            - AO
            - AQ
            - AR
            - AS
            - AT
            - AU
            - AW
            - AX
            - AZ
            - BA
            - BB
            - BD
            - BE
            - BF
            - BG
            - BH
            - BI
            - BJ
            - BL
            - BM
            - BN
            - BO
            - BQ
            - BR
            - BS
            - BT
            - BV
            - BW
            - BY
            - BZ
            - CA
            - CC
            - CD
            - CF
            - CG
            - CH
            - CI
            - CK
            - CL
            - CM
            - CN
            - CO
            - CR
            - CU
            - CV
            - CW
            - CX
            - CY
            - CZ
            - DE
            - DJ
            - DK
            - DM
            - DO
            - DZ
            - EC
            - EE
            - EG
            - EH
            - ER
            - ES
            - ET
            - FI
            - FJ
            - FK
            - FM
            - FO
            - FR
            - GA
            - GB
            - GD
            - GE
            - GF
            - GG
            - GH
            - GI
            - GL
            - GM
            - GN
            - GP
            - GQ
            - GR
            - GS
            - GT
            - GU
            - GW
            - GY
            - HK
            - HM
            - HN
            - HR
            - HT
            - HU
            - ID
            - IE
            - IL
            - IM
            - IN
            - IO
            - IQ
            - IR
            - IS
            - IT
            - JE
            - JM
            - JO
            - JP
            - KE
            - KG
            - KH
            - KI
            - KM
            - KN
            - KP
            - KR
            - KW
            - KY
            - KZ
            - LA
            - LB
            - LC
            - LI
            - LK
            - LR
            - LS
            - LT
            - LU
            - LV
            - LY
            - MA
            - MC
            - MD
            - ME
            - MF
            - MG
            - MH
            - MK
            - ML
            - MM
            - MN
            - MO
            - MP
            - MQ
            - MR
            - MS
            - MT
            - MU
            - MV
            - MW
            - MX
            - MY
            - MZ
            - NA
            - NC
            - NE
            - NF
            - NG
            - NI
            - NL
            - "NO"
            - NP
            - NR
            - NU
            - NZ
            - OM
            - PA
            - PE
            - PF
            - PG
            - PH
            - PK
            - PL
            - PM
            - PN
            - PR
            - PS
            - PT
            - PW
            - PY
            - QA
            - RE
            - RO
            - RS
            - RU
            - RW
            - SA
            - SB
            - SC
            - SD
            - SE
            - SG
            - SH
            - SI
            - SJ
            - SK
            - SL
            - SM
            - SN
            - SO
            - SR
            - SS
            - ST
            - SV
            - SX
            - SY
            - SZ
            - TC
            - TD
            - TF
            - TG
            - TH
            - TJ
            - TK
            - TL
            - TM
            - TN
            - TO
            - TR
            - TT
            - TV
            - TW
            - TZ
            - UA
            - UG
            - UM
            - US
            - UY
            - UZ
            - VA
            - VC
            - VE
            - VG
            - VI
            - VN
            - VU
            - WF
            - WS
            - YE
            - YT
            - ZA
            - ZM
            - ZW
          title: CountryAlpha2
          examples:
            - US
            - SE
            - FR
          x-speakeasy-enums:
            - AD
            - AE
            - AF
            - AG
            - AI
            - AL
            - AM
            - AO
            - AQ
            - AR
            - AS
            - AT
            - AU
            - AW
            - AX
            - AZ
            - BA
            - BB
            - BD
            - BE
            - BF
            - BG
            - BH
            - BI
            - BJ
            - BL
            - BM
            - BN
            - BO
            - BQ
            - BR
            - BS
            - BT
            - BV
            - BW
            - BY
            - BZ
            - CA
            - CC
            - CD
            - CF
            - CG
            - CH
            - CI
            - CK
            - CL
            - CM
            - CN
            - CO
            - CR
            - CU
            - CV
            - CW
            - CX
            - CY
            - CZ
            - DE
            - DJ
            - DK
            - DM
            - DO
            - DZ
            - EC
            - EE
            - EG
            - EH
            - ER
            - ES
            - ET
            - FI
            - FJ
            - FK
            - FM
            - FO
            - FR
            - GA
            - GB
            - GD
            - GE
            - GF
            - GG
            - GH
            - GI
            - GL
            - GM
            - GN
            - GP
            - GQ
            - GR
            - GS
            - GT
            - GU
            - GW
            - GY
            - HK
            - HM
            - HN
            - HR
            - HT
            - HU
            - ID
            - IE
            - IL
            - IM
            - IN
            - IO
            - IQ
            - IR
            - IS
            - IT
            - JE
            - JM
            - JO
            - JP
            - KE
            - KG
            - KH
            - KI
            - KM
            - KN
            - KP
            - KR
            - KW
            - KY
            - KZ
            - LA
            - LB
            - LC
            - LI
            - LK
            - LR
            - LS
            - LT
            - LU
            - LV
            - LY
            - MA
            - MC
            - MD
            - ME
            - MF
            - MG
            - MH
            - MK
            - ML
            - MM
            - MN
            - MO
            - MP
            - MQ
            - MR
            - MS
            - MT
            - MU
            - MV
            - MW
            - MX
            - MY
            - MZ
            - NA
            - NC
            - NE
            - NF
            - NG
            - NI
            - NL
            - "NO"
            - NP
            - NR
            - NU
            - NZ
            - OM
            - PA
            - PE
            - PF
            - PG
            - PH
            - PK
            - PL
            - PM
            - PN
            - PR
            - PS
            - PT
            - PW
            - PY
            - QA
            - RE
            - RO
            - RS
            - RU
            - RW
            - SA
            - SB
            - SC
            - SD
            - SE
            - SG
            - SH
            - SI
            - SJ
            - SK
            - SL
            - SM
            - SN
            - SO
            - SR
            - SS
            - ST
            - SV
            - SX
            - SY
            - SZ
            - TC
            - TD
            - TF
            - TG
            - TH
            - TJ
            - TK
            - TL
            - TM
            - TN
            - TO
            - TR
            - TT
            - TV
            - TW
            - TZ
            - UA
            - UG
            - UM
            - US
            - UY
            - UZ
            - VA
            - VC
            - VE
            - VG
            - VI
            - VN
            - VU
            - WF
            - WS
            - YE
            - YT
            - ZA
            - ZM
            - ZW
      type: object
      required:
        - country
      title: Address
    AddressInput:
      properties:
        line1:
          anyOf:
            - type: string
            - type: "null"
          title: Line1
        line2:
          anyOf:
            - type: string
            - type: "null"
          title: Line2
        postal_code:
          anyOf:
            - type: string
            - type: "null"
          title: Postal Code
        city:
          anyOf:
            - type: string
            - type: "null"
          title: City
        state:
          anyOf:
            - type: string
            - type: "null"
          title: State
        country:
          type: string
          enum:
            - AD
            - AE
            - AF
            - AG
            - AI
            - AL
            - AM
            - AO
            - AQ
            - AR
            - AS
            - AT
            - AU
            - AW
            - AX
            - AZ
            - BA
            - BB
            - BD
            - BE
            - BF
            - BG
            - BH
            - BI
            - BJ
            - BL
            - BM
            - BN
            - BO
            - BQ
            - BR
            - BS
            - BT
            - BV
            - BW
            - BY
            - BZ
            - CA
            - CC
            - CD
            - CF
            - CG
            - CH
            - CI
            - CK
            - CL
            - CM
            - CN
            - CO
            - CR
            - CV
            - CW
            - CX
            - CY
            - CZ
            - DE
            - DJ
            - DK
            - DM
            - DO
            - DZ
            - EC
            - EE
            - EG
            - EH
            - ER
            - ES
            - ET
            - FI
            - FJ
            - FK
            - FM
            - FO
            - FR
            - GA
            - GB
            - GD
            - GE
            - GF
            - GG
            - GH
            - GI
            - GL
            - GM
            - GN
            - GP
            - GQ
            - GR
            - GS
            - GT
            - GU
            - GW
            - GY
            - HK
            - HM
            - HN
            - HR
            - HT
            - HU
            - ID
            - IE
            - IL
            - IM
            - IN
            - IO
            - IQ
            - IS
            - IT
            - JE
            - JM
            - JO
            - JP
            - KE
            - KG
            - KH
            - KI
            - KM
            - KN
            - KR
            - KW
            - KY
            - KZ
            - LA
            - LB
            - LC
            - LI
            - LK
            - LR
            - LS
            - LT
            - LU
            - LV
            - LY
            - MA
            - MC
            - MD
            - ME
            - MF
            - MG
            - MH
            - MK
            - ML
            - MM
            - MN
            - MO
            - MP
            - MQ
            - MR
            - MS
            - MT
            - MU
            - MV
            - MW
            - MX
            - MY
            - MZ
            - NA
            - NC
            - NE
            - NF
            - NG
            - NI
            - NL
            - "NO"
            - NP
            - NR
            - NU
            - NZ
            - OM
            - PA
            - PE
            - PF
            - PG
            - PH
            - PK
            - PL
            - PM
            - PN
            - PR
            - PS
            - PT
            - PW
            - PY
            - QA
            - RE
            - RO
            - RS
            - RW
            - SA
            - SB
            - SC
            - SD
            - SE
            - SG
            - SH
            - SI
            - SJ
            - SK
            - SL
            - SM
            - SN
            - SO
            - SR
            - SS
            - ST
            - SV
            - SX
            - SZ
            - TC
            - TD
            - TF
            - TG
            - TH
            - TJ
            - TK
            - TL
            - TM
            - TN
            - TO
            - TR
            - TT
            - TV
            - TW
            - TZ
            - UA
            - UG
            - UM
            - US
            - UY
            - UZ
            - VA
            - VC
            - VE
            - VG
            - VI
            - VN
            - VU
            - WF
            - WS
            - YE
            - YT
            - ZA
            - ZM
            - ZW
          title: CountryAlpha2Input
          examples:
            - US
            - SE
            - FR
          x-speakeasy-enums:
            - AD
            - AE
            - AF
            - AG
            - AI
            - AL
            - AM
            - AO
            - AQ
            - AR
            - AS
            - AT
            - AU
            - AW
            - AX
            - AZ
            - BA
            - BB
            - BD
            - BE
            - BF
            - BG
            - BH
            - BI
            - BJ
            - BL
            - BM
            - BN
            - BO
            - BQ
            - BR
            - BS
            - BT
            - BV
            - BW
            - BY
            - BZ
            - CA
            - CC
            - CD
            - CF
            - CG
            - CH
            - CI
            - CK
            - CL
            - CM
            - CN
            - CO
            - CR
            - CV
            - CW
            - CX
            - CY
            - CZ
            - DE
            - DJ
            - DK
            - DM
            - DO
            - DZ
            - EC
            - EE
            - EG
            - EH
            - ER
            - ES
            - ET
            - FI
            - FJ
            - FK
            - FM
            - FO
            - FR
            - GA
            - GB
            - GD
            - GE
            - GF
            - GG
            - GH
            - GI
            - GL
            - GM
            - GN
            - GP
            - GQ
            - GR
            - GS
            - GT
            - GU
            - GW
            - GY
            - HK
            - HM
            - HN
            - HR
            - HT
            - HU
            - ID
            - IE
            - IL
            - IM
            - IN
            - IO
            - IQ
            - IS
            - IT
            - JE
            - JM
            - JO
            - JP
            - KE
            - KG
            - KH
            - KI
            - KM
            - KN
            - KR
            - KW
            - KY
            - KZ
            - LA
            - LB
            - LC
            - LI
            - LK
            - LR
            - LS
            - LT
            - LU
            - LV
            - LY
            - MA
            - MC
            - MD
            - ME
            - MF
            - MG
            - MH
            - MK
            - ML
            - MM
            - MN
            - MO
            - MP
            - MQ
            - MR
            - MS
            - MT
            - MU
            - MV
            - MW
            - MX
            - MY
            - MZ
            - NA
            - NC
            - NE
            - NF
            - NG
            - NI
            - NL
            - "NO"
            - NP
            - NR
            - NU
            - NZ
            - OM
            - PA
            - PE
            - PF
            - PG
            - PH
            - PK
            - PL
            - PM
            - PN
            - PR
            - PS
            - PT
            - PW
            - PY
            - QA
            - RE
            - RO
            - RS
            - RW
            - SA
            - SB
            - SC
            - SD
            - SE
            - SG
            - SH
            - SI
            - SJ
            - SK
            - SL
            - SM
            - SN
            - SO
            - SR
            - SS
            - ST
            - SV
            - SX
            - SZ
            - TC
            - TD
            - TF
            - TG
            - TH
            - TJ
            - TK
            - TL
            - TM
            - TN
            - TO
            - TR
            - TT
            - TV
            - TW
            - TZ
            - UA
            - UG
            - UM
            - US
            - UY
            - UZ
            - VA
            - VC
            - VE
            - VG
            - VI
            - VN
            - VU
            - WF
            - WS
            - YE
            - YT
            - ZA
            - ZM
            - ZW
      type: object
      required:
        - country
      title: AddressInput
    AttachedCustomField:
      properties:
        custom_field_id:
          type: string
          format: uuid4
          title: Custom Field Id
          description: ID of the custom field.
        custom_field:
          $ref: "#/components/schemas/CustomField"
          title: CustomField
        order:
          type: integer
          title: Order
          description: Order of the custom field in the resource.
        required:
          type: boolean
          title: Required
          description: Whether the value is required for this custom field.
      type: object
      required:
        - custom_field_id
        - custom_field
        - order
        - required
      title: AttachedCustomField
      description: Schema of a custom field attached to a resource.
    BenefitPublic:
      properties:
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the benefit.
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        type:
          $ref: "#/components/schemas/BenefitType"
          description: The type of the benefit.
        description:
          type: string
          title: Description
          description: The description of the benefit.
        selectable:
          type: boolean
          title: Selectable
          description: Whether the benefit is selectable when creating a product.
        deletable:
          type: boolean
          title: Deletable
          description: Whether the benefit is deletable.
        organization_id:
          type: string
          format: uuid4
          title: Organization Id
          description: The ID of the organization owning the benefit.
      type: object
      required:
        - id
        - created_at
        - modified_at
        - type
        - description
        - selectable
        - deletable
        - organization_id
      title: BenefitPublic
    BenefitType:
      type: string
      enum:
        - custom
        - discord
        - github_repository
        - downloadables
        - license_keys
        - meter_credit
      title: BenefitType
    BillingAddressFieldMode:
      type: string
      enum:
        - required
        - optional
        - disabled
      title: BillingAddressFieldMode
    CheckoutBillingAddressFields:
      properties:
        country:
          $ref: "#/components/schemas/BillingAddressFieldMode"
        state:
          $ref: "#/components/schemas/BillingAddressFieldMode"
        city:
          $ref: "#/components/schemas/BillingAddressFieldMode"
        postal_code:
          $ref: "#/components/schemas/BillingAddressFieldMode"
        line1:
          $ref: "#/components/schemas/BillingAddressFieldMode"
        line2:
          $ref: "#/components/schemas/BillingAddressFieldMode"
      type: object
      required:
        - country
        - state
        - city
        - postal_code
        - line1
        - line2
      title: CheckoutBillingAddressFields
    CheckoutDiscountFixedOnceForeverDuration:
      properties:
        duration:
          $ref: "#/components/schemas/DiscountDuration"
        type:
          $ref: "#/components/schemas/DiscountType"
        amount:
          type: integer
          title: Amount
          examples:
            - 1000
        currency:
          type: string
          title: Currency
          examples:
            - usd
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        name:
          type: string
          title: Name
        code:
          anyOf:
            - type: string
            - type: "null"
          title: Code
      type: object
      required:
        - duration
        - type
        - amount
        - currency
        - id
        - name
        - code
      title: CheckoutDiscountFixedOnceForeverDuration
      description: Schema for a fixed amount discount that is applied once or forever.
    CheckoutDiscountFixedRepeatDuration:
      properties:
        duration:
          $ref: "#/components/schemas/DiscountDuration"
        duration_in_months:
          type: integer
          title: Duration In Months
        type:
          $ref: "#/components/schemas/DiscountType"
        amount:
          type: integer
          title: Amount
          examples:
            - 1000
        currency:
          type: string
          title: Currency
          examples:
            - usd
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        name:
          type: string
          title: Name
        code:
          anyOf:
            - type: string
            - type: "null"
          title: Code
      type: object
      required:
        - duration
        - duration_in_months
        - type
        - amount
        - currency
        - id
        - name
        - code
      title: CheckoutDiscountFixedRepeatDuration
      description: |-
        Schema for a fixed amount discount that is applied on every invoice
        for a certain number of months.
    CheckoutDiscountPercentageOnceForeverDuration:
      properties:
        duration:
          $ref: "#/components/schemas/DiscountDuration"
        type:
          $ref: "#/components/schemas/DiscountType"
        basis_points:
          type: integer
          title: Basis Points
          description: >-
            Discount percentage in basis points. A basis point is 1/100th of a
            percent. For example, 1000 basis points equals a 10% discount.
          examples:
            - 1000
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        name:
          type: string
          title: Name
        code:
          anyOf:
            - type: string
            - type: "null"
          title: Code
      type: object
      required:
        - duration
        - type
        - basis_points
        - id
        - name
        - code
      title: CheckoutDiscountPercentageOnceForeverDuration
      description: Schema for a percentage discount that is applied once or forever.
    CheckoutDiscountPercentageRepeatDuration:
      properties:
        duration:
          $ref: "#/components/schemas/DiscountDuration"
        duration_in_months:
          type: integer
          title: Duration In Months
        type:
          $ref: "#/components/schemas/DiscountType"
        basis_points:
          type: integer
          title: Basis Points
          description: >-
            Discount percentage in basis points. A basis point is 1/100th of a
            percent. For example, 1000 basis points equals a 10% discount.
          examples:
            - 1000
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        name:
          type: string
          title: Name
        code:
          anyOf:
            - type: string
            - type: "null"
          title: Code
      type: object
      required:
        - duration
        - duration_in_months
        - type
        - basis_points
        - id
        - name
        - code
      title: CheckoutDiscountPercentageRepeatDuration
      description: |-
        Schema for a percentage discount that is applied on every invoice
        for a certain number of months.
    CheckoutProduct:
      properties:
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        trial_interval:
          anyOf:
            - $ref: "#/components/schemas/TrialInterval"
            - type: "null"
          description: The interval unit for the trial period.
        trial_interval_count:
          anyOf:
            - type: integer
            - type: "null"
          title: Trial Interval Count
          description: The number of interval units for the trial period.
        name:
          type: string
          title: Name
          description: The name of the product.
        description:
          anyOf:
            - type: string
            - type: "null"
          title: Description
          description: The description of the product.
        recurring_interval:
          anyOf:
            - $ref: "#/components/schemas/SubscriptionRecurringInterval"
            - type: "null"
          description: >-
            The recurring interval of the product. If `None`, the product is a
            one-time purchase.
        recurring_interval_count:
          anyOf:
            - type: integer
            - type: "null"
          title: Recurring Interval Count
          description: >-
            Number of interval units of the subscription. If this is set to 1
            the charge will happen every interval (e.g. every month), if set to
            2 it will be every other month, and so on. None for one-time
            products.
        is_recurring:
          type: boolean
          title: Is Recurring
          description: Whether the product is a subscription.
        is_archived:
          type: boolean
          title: Is Archived
          description: Whether the product is archived and no longer available.
        organization_id:
          type: string
          format: uuid4
          title: Organization Id
          description: The ID of the organization owning the product.
        prices:
          items:
            oneOf:
              - $ref: "#/components/schemas/LegacyRecurringProductPrice"
              - $ref: "#/components/schemas/ProductPrice"
          type: array
          title: Prices
          description: List of prices for this product.
        benefits:
          items:
            $ref: "#/components/schemas/BenefitPublic"
          type: array
          title: BenefitPublic
          description: List of benefits granted by the product.
        medias:
          items:
            $ref: "#/components/schemas/ProductMediaFileRead"
          type: array
          title: Medias
          description: List of medias associated to the product.
      type: object
      required:
        - id
        - created_at
        - modified_at
        - trial_interval
        - trial_interval_count
        - name
        - description
        - recurring_interval
        - recurring_interval_count
        - is_recurring
        - is_archived
        - organization_id
        - prices
        - benefits
        - medias
      title: CheckoutProduct
      description: Product data for a checkout session.
    CheckoutStatus:
      type: string
      enum:
        - open
        - expired
        - confirmed
        - succeeded
        - failed
      title: CheckoutStatus
    CustomField:
      oneOf:
        - $ref: "#/components/schemas/CustomFieldText"
        - $ref: "#/components/schemas/CustomFieldNumber"
        - $ref: "#/components/schemas/CustomFieldDate"
        - $ref: "#/components/schemas/CustomFieldCheckbox"
        - $ref: "#/components/schemas/CustomFieldSelect"
      discriminator:
        propertyName: type
        mapping:
          checkbox: "#/components/schemas/CustomFieldCheckbox"
          date: "#/components/schemas/CustomFieldDate"
          number: "#/components/schemas/CustomFieldNumber"
          select: "#/components/schemas/CustomFieldSelect"
          text: "#/components/schemas/CustomFieldText"
    CustomFieldCheckbox:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        metadata:
          additionalProperties:
            anyOf:
              - type: string
              - type: integer
              - type: number
              - type: boolean
          type: object
          title: Metadata
        type:
          type: string
          const: checkbox
          title: Type
        slug:
          type: string
          title: Slug
          description: >-
            Identifier of the custom field. It'll be used as key when storing
            the value.
        name:
          type: string
          title: Name
          description: Name of the custom field.
        organization_id:
          type: string
          format: uuid4
          title: Organization Id
          description: The ID of the organization owning the custom field.
          examples:
            - 1dbfc517-0bbf-4301-9ba8-555ca42b9737
          x-polar-selector-widget:
            displayProperty: name
            resourceName: Organization
            resourceRoot: /v1/organizations
        properties:
          $ref: "#/components/schemas/CustomFieldCheckboxProperties"
      type: object
      required:
        - created_at
        - modified_at
        - id
        - metadata
        - type
        - slug
        - name
        - organization_id
        - properties
      title: CustomFieldCheckbox
      description: Schema for a custom field of type checkbox.
    CustomFieldCheckboxProperties:
      properties:
        form_label:
          type: string
          minLength: 1
          title: Form Label
        form_help_text:
          type: string
          minLength: 1
          title: Form Help Text
        form_placeholder:
          type: string
          minLength: 1
          title: Form Placeholder
      type: object
      title: CustomFieldCheckboxProperties
    CustomFieldDate:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        metadata:
          additionalProperties:
            anyOf:
              - type: string
              - type: integer
              - type: number
              - type: boolean
          type: object
          title: Metadata
        type:
          type: string
          const: date
          title: Type
        slug:
          type: string
          title: Slug
          description: >-
            Identifier of the custom field. It'll be used as key when storing
            the value.
        name:
          type: string
          title: Name
          description: Name of the custom field.
        organization_id:
          type: string
          format: uuid4
          title: Organization Id
          description: The ID of the organization owning the custom field.
          examples:
            - 1dbfc517-0bbf-4301-9ba8-555ca42b9737
          x-polar-selector-widget:
            displayProperty: name
            resourceName: Organization
            resourceRoot: /v1/organizations
        properties:
          $ref: "#/components/schemas/CustomFieldDateProperties"
      type: object
      required:
        - created_at
        - modified_at
        - id
        - metadata
        - type
        - slug
        - name
        - organization_id
        - properties
      title: CustomFieldDate
      description: Schema for a custom field of type date.
    CustomFieldDateProperties:
      properties:
        form_label:
          type: string
          minLength: 1
          title: Form Label
        form_help_text:
          type: string
          minLength: 1
          title: Form Help Text
        form_placeholder:
          type: string
          minLength: 1
          title: Form Placeholder
        ge:
          type: integer
          title: Ge
        le:
          type: integer
          title: Le
      type: object
      title: CustomFieldDateProperties
    CustomFieldNumber:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        metadata:
          additionalProperties:
            anyOf:
              - type: string
              - type: integer
              - type: number
              - type: boolean
          type: object
          title: Metadata
        type:
          type: string
          const: number
          title: Type
        slug:
          type: string
          title: Slug
          description: >-
            Identifier of the custom field. It'll be used as key when storing
            the value.
        name:
          type: string
          title: Name
          description: Name of the custom field.
        organization_id:
          type: string
          format: uuid4
          title: Organization Id
          description: The ID of the organization owning the custom field.
          examples:
            - 1dbfc517-0bbf-4301-9ba8-555ca42b9737
          x-polar-selector-widget:
            displayProperty: name
            resourceName: Organization
            resourceRoot: /v1/organizations
        properties:
          $ref: "#/components/schemas/CustomFieldNumberProperties"
      type: object
      required:
        - created_at
        - modified_at
        - id
        - metadata
        - type
        - slug
        - name
        - organization_id
        - properties
      title: CustomFieldNumber
      description: Schema for a custom field of type number.
    CustomFieldNumberProperties:
      properties:
        form_label:
          type: string
          minLength: 1
          title: Form Label
        form_help_text:
          type: string
          minLength: 1
          title: Form Help Text
        form_placeholder:
          type: string
          minLength: 1
          title: Form Placeholder
        ge:
          type: integer
          title: Ge
        le:
          type: integer
          title: Le
      type: object
      title: CustomFieldNumberProperties
    CustomFieldSelect:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        metadata:
          additionalProperties:
            anyOf:
              - type: string
              - type: integer
              - type: number
              - type: boolean
          type: object
          title: Metadata
        type:
          type: string
          const: select
          title: Type
        slug:
          type: string
          title: Slug
          description: >-
            Identifier of the custom field. It'll be used as key when storing
            the value.
        name:
          type: string
          title: Name
          description: Name of the custom field.
        organization_id:
          type: string
          format: uuid4
          title: Organization Id
          description: The ID of the organization owning the custom field.
          examples:
            - 1dbfc517-0bbf-4301-9ba8-555ca42b9737
          x-polar-selector-widget:
            displayProperty: name
            resourceName: Organization
            resourceRoot: /v1/organizations
        properties:
          $ref: "#/components/schemas/CustomFieldSelectProperties"
      type: object
      required:
        - created_at
        - modified_at
        - id
        - metadata
        - type
        - slug
        - name
        - organization_id
        - properties
      title: CustomFieldSelect
      description: Schema for a custom field of type select.
    CustomFieldSelectOption:
      properties:
        value:
          type: string
          minLength: 1
          title: Value
        label:
          type: string
          minLength: 1
          title: Label
      type: object
      required:
        - value
        - label
      title: CustomFieldSelectOption
    CustomFieldSelectProperties:
      properties:
        form_label:
          type: string
          minLength: 1
          title: Form Label
        form_help_text:
          type: string
          minLength: 1
          title: Form Help Text
        form_placeholder:
          type: string
          minLength: 1
          title: Form Placeholder
        options:
          items:
            $ref: "#/components/schemas/CustomFieldSelectOption"
          type: array
          minItems: 1
          title: Options
      type: object
      required:
        - options
      title: CustomFieldSelectProperties
    CustomFieldText:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        metadata:
          additionalProperties:
            anyOf:
              - type: string
              - type: integer
              - type: number
              - type: boolean
          type: object
          title: Metadata
        type:
          type: string
          const: text
          title: Type
        slug:
          type: string
          title: Slug
          description: >-
            Identifier of the custom field. It'll be used as key when storing
            the value.
        name:
          type: string
          title: Name
          description: Name of the custom field.
        organization_id:
          type: string
          format: uuid4
          title: Organization Id
          description: The ID of the organization owning the custom field.
          examples:
            - 1dbfc517-0bbf-4301-9ba8-555ca42b9737
          x-polar-selector-widget:
            displayProperty: name
            resourceName: Organization
            resourceRoot: /v1/organizations
        properties:
          $ref: "#/components/schemas/CustomFieldTextProperties"
      type: object
      required:
        - created_at
        - modified_at
        - id
        - metadata
        - type
        - slug
        - name
        - organization_id
        - properties
      title: CustomFieldText
      description: Schema for a custom field of type text.
    CustomFieldTextProperties:
      properties:
        form_label:
          type: string
          minLength: 1
          title: Form Label
        form_help_text:
          type: string
          minLength: 1
          title: Form Help Text
        form_placeholder:
          type: string
          minLength: 1
          title: Form Placeholder
        textarea:
          type: boolean
          title: Textarea
        min_length:
          type: integer
          minimum: 0
          title: Min Length
        max_length:
          type: integer
          minimum: 0
          title: Max Length
      type: object
      title: CustomFieldTextProperties
    DiscountDuration:
      type: string
      enum:
        - once
        - forever
        - repeating
      title: DiscountDuration
    DiscountType:
      type: string
      enum:
        - fixed
        - percentage
      title: DiscountType
    LegacyRecurringProductPrice:
      oneOf:
        - $ref: "#/components/schemas/LegacyRecurringProductPriceFixed"
        - $ref: "#/components/schemas/LegacyRecurringProductPriceCustom"
        - $ref: "#/components/schemas/LegacyRecurringProductPriceFree"
      discriminator:
        propertyName: amount_type
        mapping:
          custom: "#/components/schemas/LegacyRecurringProductPriceCustom"
          fixed: "#/components/schemas/LegacyRecurringProductPriceFixed"
          free: "#/components/schemas/LegacyRecurringProductPriceFree"
    LegacyRecurringProductPriceCustom:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the price.
        source:
          $ref: "#/components/schemas/ProductPriceSource"
          description: >-
            The source of the price . `catalog` is a predefined price, while
            `ad_hoc` is a price created dynamically on a Checkout session.
        amount_type:
          type: string
          const: custom
          title: Amount Type
        is_archived:
          type: boolean
          title: Is Archived
          description: Whether the price is archived and no longer available.
        product_id:
          type: string
          format: uuid4
          title: Product Id
          description: The ID of the product owning the price.
        type:
          type: string
          const: recurring
          title: Type
          description: The type of the price.
        recurring_interval:
          $ref: "#/components/schemas/SubscriptionRecurringInterval"
          description: The recurring interval of the price.
        price_currency:
          type: string
          title: Price Currency
          description: The currency.
        minimum_amount:
          anyOf:
            - type: integer
            - type: "null"
          title: Minimum Amount
          description: The minimum amount the customer can pay.
        maximum_amount:
          anyOf:
            - type: integer
            - type: "null"
          title: Maximum Amount
          description: The maximum amount the customer can pay.
        preset_amount:
          anyOf:
            - type: integer
            - type: "null"
          title: Preset Amount
          description: The initial amount shown to the customer.
        legacy:
          type: boolean
          const: true
          title: Legacy
      type: object
      required:
        - created_at
        - modified_at
        - id
        - source
        - amount_type
        - is_archived
        - product_id
        - type
        - recurring_interval
        - price_currency
        - minimum_amount
        - maximum_amount
        - preset_amount
        - legacy
      title: LegacyRecurringProductPriceCustom
      description: >-
        A pay-what-you-want recurring price for a product, i.e. a subscription.


        **Deprecated**: The recurring interval should be set on the product
        itself.
    LegacyRecurringProductPriceFixed:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the price.
        source:
          $ref: "#/components/schemas/ProductPriceSource"
          description: >-
            The source of the price . `catalog` is a predefined price, while
            `ad_hoc` is a price created dynamically on a Checkout session.
        amount_type:
          type: string
          const: fixed
          title: Amount Type
        is_archived:
          type: boolean
          title: Is Archived
          description: Whether the price is archived and no longer available.
        product_id:
          type: string
          format: uuid4
          title: Product Id
          description: The ID of the product owning the price.
        type:
          type: string
          const: recurring
          title: Type
          description: The type of the price.
        recurring_interval:
          $ref: "#/components/schemas/SubscriptionRecurringInterval"
          description: The recurring interval of the price.
        price_currency:
          type: string
          title: Price Currency
          description: The currency.
        price_amount:
          type: integer
          title: Price Amount
          description: The price in cents.
        legacy:
          type: boolean
          const: true
          title: Legacy
      type: object
      required:
        - created_at
        - modified_at
        - id
        - source
        - amount_type
        - is_archived
        - product_id
        - type
        - recurring_interval
        - price_currency
        - price_amount
        - legacy
      title: LegacyRecurringProductPriceFixed
      description: >-
        A recurring price for a product, i.e. a subscription.


        **Deprecated**: The recurring interval should be set on the product
        itself.
    LegacyRecurringProductPriceFree:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the price.
        source:
          $ref: "#/components/schemas/ProductPriceSource"
          description: >-
            The source of the price . `catalog` is a predefined price, while
            `ad_hoc` is a price created dynamically on a Checkout session.
        amount_type:
          type: string
          const: free
          title: Amount Type
        is_archived:
          type: boolean
          title: Is Archived
          description: Whether the price is archived and no longer available.
        product_id:
          type: string
          format: uuid4
          title: Product Id
          description: The ID of the product owning the price.
        type:
          type: string
          const: recurring
          title: Type
          description: The type of the price.
        recurring_interval:
          $ref: "#/components/schemas/SubscriptionRecurringInterval"
          description: The recurring interval of the price.
        legacy:
          type: boolean
          const: true
          title: Legacy
      type: object
      required:
        - created_at
        - modified_at
        - id
        - source
        - amount_type
        - is_archived
        - product_id
        - type
        - recurring_interval
        - legacy
      title: LegacyRecurringProductPriceFree
      description: >-
        A free recurring price for a product, i.e. a subscription.


        **Deprecated**: The recurring interval should be set on the product
        itself.
    PaymentProcessor:
      type: string
      enum:
        - stripe
      title: PaymentProcessor
    ProductMediaFileRead:
      properties:
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        organization_id:
          type: string
          format: uuid4
          title: Organization Id
        name:
          type: string
          title: Name
        path:
          type: string
          title: Path
        mime_type:
          type: string
          title: Mime Type
        size:
          type: integer
          title: Size
        storage_version:
          anyOf:
            - type: string
            - type: "null"
          title: Storage Version
        checksum_etag:
          anyOf:
            - type: string
            - type: "null"
          title: Checksum Etag
        checksum_sha256_base64:
          anyOf:
            - type: string
            - type: "null"
          title: Checksum Sha256 Base64
        checksum_sha256_hex:
          anyOf:
            - type: string
            - type: "null"
          title: Checksum Sha256 Hex
        last_modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Last Modified At
        version:
          anyOf:
            - type: string
            - type: "null"
          title: Version
        service:
          type: string
          const: product_media
          title: Service
        is_uploaded:
          type: boolean
          title: Is Uploaded
        created_at:
          type: string
          format: date-time
          title: Created At
        size_readable:
          type: string
          title: Size Readable
        public_url:
          type: string
          title: Public Url
      type: object
      required:
        - id
        - organization_id
        - name
        - path
        - mime_type
        - size
        - storage_version
        - checksum_etag
        - checksum_sha256_base64
        - checksum_sha256_hex
        - last_modified_at
        - version
        - service
        - is_uploaded
        - created_at
        - size_readable
        - public_url
      title: ProductMediaFileRead
      description: File to be used as a product media file.
    ProductPrice:
      oneOf:
        - $ref: "#/components/schemas/ProductPriceFixed"
        - $ref: "#/components/schemas/ProductPriceCustom"
        - $ref: "#/components/schemas/ProductPriceFree"
        - $ref: "#/components/schemas/ProductPriceSeatBased"
        - $ref: "#/components/schemas/ProductPriceMeteredUnit"
      discriminator:
        propertyName: amount_type
        mapping:
          custom: "#/components/schemas/ProductPriceCustom"
          fixed: "#/components/schemas/ProductPriceFixed"
          free: "#/components/schemas/ProductPriceFree"
          metered_unit: "#/components/schemas/ProductPriceMeteredUnit"
          seat_based: "#/components/schemas/ProductPriceSeatBased"
    ProductPriceCustom:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the price.
        source:
          $ref: "#/components/schemas/ProductPriceSource"
          description: >-
            The source of the price . `catalog` is a predefined price, while
            `ad_hoc` is a price created dynamically on a Checkout session.
        amount_type:
          type: string
          const: custom
          title: Amount Type
        is_archived:
          type: boolean
          title: Is Archived
          description: Whether the price is archived and no longer available.
        product_id:
          type: string
          format: uuid4
          title: Product Id
          description: The ID of the product owning the price.
        type:
          $ref: "#/components/schemas/ProductPriceType"
          deprecated: true
        recurring_interval:
          anyOf:
            - $ref: "#/components/schemas/SubscriptionRecurringInterval"
            - type: "null"
          deprecated: true
        price_currency:
          type: string
          title: Price Currency
          description: The currency.
        minimum_amount:
          anyOf:
            - type: integer
            - type: "null"
          title: Minimum Amount
          description: The minimum amount the customer can pay.
        maximum_amount:
          anyOf:
            - type: integer
            - type: "null"
          title: Maximum Amount
          description: The maximum amount the customer can pay.
        preset_amount:
          anyOf:
            - type: integer
            - type: "null"
          title: Preset Amount
          description: The initial amount shown to the customer.
      type: object
      required:
        - created_at
        - modified_at
        - id
        - source
        - amount_type
        - is_archived
        - product_id
        - type
        - recurring_interval
        - price_currency
        - minimum_amount
        - maximum_amount
        - preset_amount
      title: ProductPriceCustom
      description: A pay-what-you-want price for a product.
    ProductPriceCustomCreate:
      properties:
        amount_type:
          type: string
          const: custom
          title: Amount Type
        price_currency:
          type: string
          pattern: usd
          title: Price Currency
          description: The currency. Currently, only `usd` is supported.
          default: usd
        minimum_amount:
          anyOf:
            - type: integer
              maximum: 99999999
              minimum: 50
              description: The price in cents.
            - type: "null"
          title: Minimum Amount
          description: The minimum amount the customer can pay.
        maximum_amount:
          anyOf:
            - type: integer
              maximum: 1000000
              minimum: 50
              description: The price in cents.
            - type: "null"
          title: Maximum Amount
          description: The maximum amount the customer can pay.
        preset_amount:
          anyOf:
            - type: integer
              maximum: 1000000
              minimum: 50
              description: The price in cents.
            - type: "null"
          title: Preset Amount
          description: The initial amount shown to the customer.
      type: object
      required:
        - amount_type
      title: ProductPriceCustomCreate
      description: Schema to create a pay-what-you-want price.
    ProductPriceFixed:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the price.
        source:
          $ref: "#/components/schemas/ProductPriceSource"
          description: >-
            The source of the price . `catalog` is a predefined price, while
            `ad_hoc` is a price created dynamically on a Checkout session.
        amount_type:
          type: string
          const: fixed
          title: Amount Type
        is_archived:
          type: boolean
          title: Is Archived
          description: Whether the price is archived and no longer available.
        product_id:
          type: string
          format: uuid4
          title: Product Id
          description: The ID of the product owning the price.
        type:
          $ref: "#/components/schemas/ProductPriceType"
          deprecated: true
        recurring_interval:
          anyOf:
            - $ref: "#/components/schemas/SubscriptionRecurringInterval"
            - type: "null"
          deprecated: true
        price_currency:
          type: string
          title: Price Currency
          description: The currency.
        price_amount:
          type: integer
          title: Price Amount
          description: The price in cents.
      type: object
      required:
        - created_at
        - modified_at
        - id
        - source
        - amount_type
        - is_archived
        - product_id
        - type
        - recurring_interval
        - price_currency
        - price_amount
      title: ProductPriceFixed
      description: A fixed price for a product.
    ProductPriceFixedCreate:
      properties:
        amount_type:
          type: string
          const: fixed
          title: Amount Type
        price_amount:
          type: integer
          maximum: 99999999
          minimum: 50
          title: Price Amount
          description: The price in cents.
        price_currency:
          type: string
          pattern: usd
          title: Price Currency
          description: The currency. Currently, only `usd` is supported.
          default: usd
      type: object
      required:
        - amount_type
        - price_amount
      title: ProductPriceFixedCreate
      description: Schema to create a fixed price.
    ProductPriceFree:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the price.
        source:
          $ref: "#/components/schemas/ProductPriceSource"
          description: >-
            The source of the price . `catalog` is a predefined price, while
            `ad_hoc` is a price created dynamically on a Checkout session.
        amount_type:
          type: string
          const: free
          title: Amount Type
        is_archived:
          type: boolean
          title: Is Archived
          description: Whether the price is archived and no longer available.
        product_id:
          type: string
          format: uuid4
          title: Product Id
          description: The ID of the product owning the price.
        type:
          $ref: "#/components/schemas/ProductPriceType"
          deprecated: true
        recurring_interval:
          anyOf:
            - $ref: "#/components/schemas/SubscriptionRecurringInterval"
            - type: "null"
          deprecated: true
      type: object
      required:
        - created_at
        - modified_at
        - id
        - source
        - amount_type
        - is_archived
        - product_id
        - type
        - recurring_interval
      title: ProductPriceFree
      description: A free price for a product.
    ProductPriceFreeCreate:
      properties:
        amount_type:
          type: string
          const: free
          title: Amount Type
      type: object
      required:
        - amount_type
      title: ProductPriceFreeCreate
      description: Schema to create a free price.
    ProductPriceMeter:
      properties:
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the object.
        name:
          type: string
          title: Name
          description: The name of the meter.
      type: object
      required:
        - id
        - name
      title: ProductPriceMeter
      description: A meter associated to a metered price.
    ProductPriceMeteredUnit:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the price.
        source:
          $ref: "#/components/schemas/ProductPriceSource"
          description: >-
            The source of the price . `catalog` is a predefined price, while
            `ad_hoc` is a price created dynamically on a Checkout session.
        amount_type:
          type: string
          const: metered_unit
          title: Amount Type
        is_archived:
          type: boolean
          title: Is Archived
          description: Whether the price is archived and no longer available.
        product_id:
          type: string
          format: uuid4
          title: Product Id
          description: The ID of the product owning the price.
        type:
          $ref: "#/components/schemas/ProductPriceType"
          deprecated: true
        recurring_interval:
          anyOf:
            - $ref: "#/components/schemas/SubscriptionRecurringInterval"
            - type: "null"
          deprecated: true
        price_currency:
          type: string
          title: Price Currency
          description: The currency.
        unit_amount:
          type: string
          pattern: ^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$
          title: Unit Amount
          description: The price per unit in cents.
        cap_amount:
          anyOf:
            - type: integer
            - type: "null"
          title: Cap Amount
          description: >-
            The maximum amount in cents that can be charged, regardless of the
            number of units consumed.
        meter_id:
          type: string
          format: uuid4
          title: Meter Id
          description: The ID of the meter associated to the price.
        meter:
          $ref: "#/components/schemas/ProductPriceMeter"
          description: The meter associated to the price.
      type: object
      required:
        - created_at
        - modified_at
        - id
        - source
        - amount_type
        - is_archived
        - product_id
        - type
        - recurring_interval
        - price_currency
        - unit_amount
        - cap_amount
        - meter_id
        - meter
      title: ProductPriceMeteredUnit
      description: A metered, usage-based, price for a product, with a fixed unit price.
    ProductPriceMeteredUnitCreate:
      properties:
        amount_type:
          type: string
          const: metered_unit
          title: Amount Type
        meter_id:
          type: string
          format: uuid4
          title: Meter Id
          description: The ID of the meter associated to the price.
        price_currency:
          type: string
          pattern: usd
          title: Price Currency
          description: The currency. Currently, only `usd` is supported.
          default: usd
        unit_amount:
          anyOf:
            - type: number
              exclusiveMinimum: 0
            - type: string
              pattern: >-
                ^(?!^[-+.]*$)[+-]?0*(?:\d{0,5}|(?=[\d.]{1,18}0*$)\d{0,5}\.\d{0,12}0*$)
          title: Unit Amount
          description: The price per unit in cents. Supports up to 12 decimal places.
        cap_amount:
          anyOf:
            - type: integer
              maximum: 2147483647
              minimum: 0
            - type: "null"
          title: Cap Amount
          description: >-
            Optional maximum amount in cents that can be charged, regardless of
            the number of units consumed.
      type: object
      required:
        - amount_type
        - meter_id
        - unit_amount
      title: ProductPriceMeteredUnitCreate
      description: Schema to create a metered price with a fixed unit price.
    ProductPriceSeatBased:
      properties:
        created_at:
          type: string
          format: date-time
          title: Created At
          description: Creation timestamp of the object.
        modified_at:
          anyOf:
            - type: string
              format: date-time
            - type: "null"
          title: Modified At
          description: Last modification timestamp of the object.
        id:
          type: string
          format: uuid4
          title: Id
          description: The ID of the price.
        source:
          $ref: "#/components/schemas/ProductPriceSource"
          description: >-
            The source of the price . `catalog` is a predefined price, while
            `ad_hoc` is a price created dynamically on a Checkout session.
        amount_type:
          type: string
          const: seat_based
          title: Amount Type
        is_archived:
          type: boolean
          title: Is Archived
          description: Whether the price is archived and no longer available.
        product_id:
          type: string
          format: uuid4
          title: Product Id
          description: The ID of the product owning the price.
        type:
          $ref: "#/components/schemas/ProductPriceType"
          deprecated: true
        recurring_interval:
          anyOf:
            - $ref: "#/components/schemas/SubscriptionRecurringInterval"
            - type: "null"
          deprecated: true
        price_currency:
          type: string
          title: Price Currency
          description: The currency.
        seat_tiers:
          $ref: "#/components/schemas/ProductPriceSeatTiers"
          description: Tiered pricing based on seat quantity
      type: object
      required:
        - created_at
        - modified_at
        - id
        - source
        - amount_type
        - is_archived
        - product_id
        - type
        - recurring_interval
        - price_currency
        - seat_tiers
      title: ProductPriceSeatBased
      description: A seat-based price for a product.
    ProductPriceSeatBasedCreate:
      properties:
        amount_type:
          type: string
          const: seat_based
          title: Amount Type
        price_currency:
          type: string
          pattern: usd
          title: Price Currency
          description: The currency. Currently, only `usd` is supported.
          default: usd
        seat_tiers:
          $ref: "#/components/schemas/ProductPriceSeatTiers"
          description: Tiered pricing based on seat quantity
      type: object
      required:
        - amount_type
        - seat_tiers
      title: ProductPriceSeatBasedCreate
      description: Schema to create a seat-based price with volume-based tiers.
    ProductPriceSeatTier:
      properties:
        min_seats:
          type: integer
          minimum: 1
          title: Min Seats
          description: Minimum number of seats (inclusive)
        max_seats:
          anyOf:
            - type: integer
              minimum: 1
            - type: "null"
          title: Max Seats
          description: Maximum number of seats (inclusive). None for unlimited.
        price_per_seat:
          type: integer
          maximum: 99999999
          minimum: 0
          title: Price Per Seat
          description: Price per seat in cents for this tier
      type: object
      required:
        - min_seats
        - price_per_seat
      title: ProductPriceSeatTier
      description: A pricing tier for seat-based pricing.
    ProductPriceSeatTiers:
      properties:
        tiers:
          items:
            $ref: "#/components/schemas/ProductPriceSeatTier"
          type: array
          minItems: 1
          title: Tiers
          description: List of pricing tiers
      type: object
      required:
        - tiers
      title: ProductPriceSeatTiers
      description: List of pricing tiers for seat-based pricing.
    ProductPriceSource:
      type: string
      enum:
        - catalog
        - ad_hoc
      title: ProductPriceSource
    ProductPriceType:
      type: string
      enum:
        - one_time
        - recurring
      title: ProductPriceType
    SubscriptionRecurringInterval:
      type: string
      enum:
        - day
        - week
        - month
        - year
      title: SubscriptionRecurringInterval
    TrialInterval:
      type: string
      enum:
        - day
        - week
        - month
        - year
      title: TrialInterval
    ValidationError:
      properties:
        loc:
          items:
            anyOf:
              - type: string
              - type: integer
          type: array
          title: Location
        msg:
          type: string
          title: Message
        type:
          type: string
          title: Error Type
      type: object
      required:
        - loc
        - msg
        - type
      title: ValidationError
```

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://polar.sh/docs/llms.txt
