# Functional Tests for NEF Emulator / Northbound APIs

## Test Plan for AsSessionWithQoS API

### Tests for HTTP POST Method
* [Test Case 1: Create subscription by Authorized NetApp](#-test-case-1-create-subscription-by-authorized-netapp)
* [Test Case 2: Create subscription when there is already an active subscription for a registered UE](#-test-case-2-create-subscription-when-there-is-already-an-active-subscription-for-a-registered-ue)
* [Test Case 3: Create subscription by unAuthorized NetApp](#-test-case-3-create-subscription-by-unauthorized-netapp)

### Tests for HTTP GET Method
* [Test Case 4: Read all active subscriptions by Authorized NetApp](#-test-case-4-read-all-active-subscriptions-by-authorized-netapp)
* [Test Case 5: Read all active subscriptions by Authorized NetApp (no active subscriptions available)](#-test-case-5-read-all-active-subscriptions-by-authorized-netapp-no-active-subscriptions-available)
* [Test Case 6: Read individual subscription by Authorized NetApp](#-test-case-6-read-individual-subscription-by-authorized-netapp)
* [Test Case 7: Read individual subscription by Authorized NetApp with invalid subscription id](#-test-case-7-read-individual-subscription-by-authorized-netapp-with-invalid-subscription-id)
* [Test Case 8: Read all active subscriptions by unAuthorized NetApp](#-test-case-8-read-all-active-subscriptions-by-unauthorized-netapp) 
* [Test case 9: Read individual subscription by unAuthorized NetApp](#-test-case-9-read-individual-subscription-by-unauthorized-netapp)

### Tests for HTTP PUT Method
* [Test Case 10: Update individual subscription by Authorized NetApp](#-test-case-10-update-individual-subscription-by-authorized-netapp)
* [Test Case 11: Update individual subscription by Authorized NetApp with invalid subscription id](#-test-case-11-update-individual-subscription-by-authorized-netapp-with-invalid-subscription-id)
* [Test case 12: Update individual subscription by unAuthorized NetApp](#-test-case-12-update-individual-subscription-by-unauthorized-netapp)

### Tests for HTTP DELETE Method
* [Test Case 13: Delete individual subscription by Authorized NetApp](#-test-case-13-delete-individual-subscription-by-authorized-netapp)
* [Test Case 14: Delete individual subscription by Authorized NetApp with invalid subscription id](#-test-case-14-delete-individual-subscription-by-authorized-netapp-with-invalid-subscription-id)
* [Test case 15: Delete individual subscription by unAuthorized NetApp](#-test-case-15-delete-individual-subscription-by-unauthorized-netapp)


## ✔ Test Case 1: Create subscription by Authorized NetApp

This test case will check that the NetApp creates a subscription successfully to the AsSessionWithQoS for a registered UE

* Pre-Conditions:
    1. The UE exists in the DB
    2. NetApp subscribes to the AsSessionWithQoS for a UE that has not an active subscription (in DB)
    3. Request includes only one of UE's identifiers 👉(ipv4, ipv6, mac address)
    4. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp subscribes to AsSessionWithQoS API with an HTTP POST request for a registered UE
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions**</kbd>
    3. Request Body: [request body]
    
* Post-Conditions:
    1. 201 Created response
    2. Response body: [response body]
    3. The URI of the created resource is returned in the 'Location' HTTP header  according to the structure: 
<kbd>**{apiRoot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions/{subscriptionId}**</kbd>

## ❌ Test Case 2: Create subscription when there is already an active subscription for a registered UE

This test case will check that whether the NetApp tries to subscribe to the AsSessionWithQoS API for a registered UE, that has an active subscription, the request is rejected.

* Pre-Conditions:
    1. The UE exists in the DB
    2. There is already an active subscription associated with this UE
    3. Request includes only one of UE's identifiers 👉(ipv4, ipv6, mac address)
    4. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp subscribes to AsSessionWithQoS API with an HTTP POST request for a registered UE
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions**</kbd>
    3. Request Body: [request body]
    
* Post-Conditions:
    1. 409 Conflict / There is already an active subscription for UE with (ipv4, ipv6, mac address) '*(ipv4, ipv6, mac address)*'

## ⛔ Test Case 3: Create subscription by unAuthorized NetApp

This test case will check that an unauthorised NetApp cannot create a subscription to the AsSessionWithQoS API

* Pre-Conditions:
    1. NetApp is NOT authorised 

* Actions:
    1. Netapp subscribes to AsSessionWithQoS API with an HTTP POST request
    2. Request includes only one of UE's identifiers 👉(ipv4, ipv6, mac address)
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions**</kbd> 
    4. Request Body: [request body]
    
* Post-Conditions:
    1. 401 Unauthorized

## ✔ Test Case 4: Read all active subscriptions by Authorized NetApp 

This test case will check if the active subscriptions are retrieved successfully by the NetApp from the AsSessionWithQoS API

* Pre-Conditions:
    1. There is at least one active subscription associated with this NetApp in the db
    2. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp sends an HTTP GET request to AsSessionWithQoS API
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions**</kbd>
    
* Post-Conditions:
    1. 200 OK response 
    2. Response body: [response body] (list of this json example) 
    3. A list with the retrieved subscriptions 


## ✔ Test Case 5: Read all active subscriptions by Authorized NetApp (no active subscriptions available)

This test case will check if there are no active subscription to be retrieved by the NetApp from the AsSessionWithQoS API

* Pre-Conditions:
    1. There are no active subscription associated with this NetApp in the db
    2. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp sends an HTTP GET request to AsSessionWithQoS API
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions**</kbd>
    
* Post-Conditions:
    1. 404 Not Found

## ✔ Test Case 6: Read individual subscription by Authorized NetApp

This test case will check if the individual subscription by the NetApp from AsSessionWithQoS API is sucessfully retrieved

* Pre-Conditions:
    1. There is one active subscription associated with the NetApp with a unique subscription id
    2. Subscription id is a valid uuid (24-character hex string)
    3. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp sends an HTTP GET request to AsSessionWithQoS API
    2. Netapp provides in the request the path parameter {subscriptionid}, which was initially retrieved in the creation of the subscription
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    
* Post-Conditions:
    1. 200 OK response 
    2. Response body: [response body]

## ❌ Test Case 7: Read individual subscription by Authorized NetApp with invalid subscription id
This test case will check if the individual subscription retrieved by the NetApp from AsSessionWithQoS API has an invalid subscription id

* Pre-Conditions:
    1. The NetApp sends a subscription id which is not associated with a subscription in the db 
    2. Subscription id is a valid uuid (24-character hex string)
    3. NetApp is authorised, i.e., has an active OAuth2 token
    
* Actions:
    1. Netapp sends an HTTP GET request to AsSessionWithQoS API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    
* Post-Conditions:
    1. 404 Not Found

## ⛔ Test Case 8: Read all active subscriptions by unAuthorized NetApp

This test case will check that an unauthorised NetApp cannot retrieve all active subscriptions from the AsSessionWithQoS API

* Pre-Conditions:
    1. NetApp is NOT authorised 

* Actions:
    1. Netapp sends an HTTP GET request to AsSessionWithQoS API
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions**</kbd> 
    
* Post-Conditions:
    1. 401 Unauthorized

## ⛔ Test case 9: Read individual subscription by unAuthorized NetApp

This test case will check that an unauthorised NetApp cannot retrieve an individual subscription from the AsSessionWithQoS API

* Pre-Conditions:
    1. NetApp is NOT authorised 

* Actions:
    1. Netapp sends an HTTP GET request to AsSessionWithQoS API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions/{subscriptionid}**</kbd> 
    
* Post-Conditions:
    1. 401 Unauthorized

## ✔ Test Case 10: Update individual subscription by Authorized NetApp

This test case will check if the individual subscription by the NetApp from AsSessionWithQoS API is sucessfully updated

* Pre-Conditions:
    1. There is one active subscription associated with the NetApp with a unique subscription id
    2. Subscription id is a valid uuid (24-character hex string)
    3. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp sends an HTTP PUT request to AsSessionWithQoS API
    2. Netapp provides in the request the path parameter {subscriptionid}, which was initially retrieved in the creation of the subscription
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    4. Request body: [request body]
    
* Post-Conditions:
    1. 200 OK response 
    2. Response body: [response body]

## ❌ Test Case 11: Update individual subscription by Authorized NetApp with invalid subscription id

This test case will check if the individual subscription that the NetApp tries to update from AsSessionWithQoS API has an invalid subscription id

* Pre-Conditions:
    1. The NetApp sends a subscription id which is not associated with a subscription in the db 
    2. Subscription id is a valid uuid (24-character hex string)
    3. NetApp is authorised, i.e., has an active OAuth2 token
    
* Actions:
    1. Netapp sends an HTTP PUT request to AsSessionWithQoS API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    4. Request body: [request body]

* Post-Conditions:
    1. 404 Not Found
    
## ⛔ Test case 12: Update individual subscription by unAuthorized NetApp

This test case will check that an unauthorised NetApp cannot update an individual subscription from the AsSessionWithQoS API

* Pre-Conditions:
    1. NetApp is NOT authorised 

* Actions:
    1. Netapp sends an HTTP PUT request to AsSessionWithQoS API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions/{subscriptionid}**</kbd> 
    4. Request body: [response body]
    
* Post-Conditions:
    1. 401 Unauthorized

## ✔ Test Case 13: Delete individual subscription by Authorized NetApp

This test case will check if the individual subscription by the NetApp from AsSessionWithQoS API is sucessfully deleted

* Pre-Conditions:
    1. There is one active subscription associated with the NetApp with a unique subscription id
    2. Subscription id is a valid uuid (24-character hex string)
    3. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp sends an HTTP DELETE request to AsSessionWithQoS API
    2. Netapp provides in the request the path parameter {subscriptionid}, which was initially retrieved in the creation of the subscription
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    
* Post-Conditions:
    1. 200 OK response 
    2. Response body: [response body]

## ❌ Test Case 14: Delete individual subscription by Authorized NetApp with invalid subscription id

This test case will check if the individual subscription that the NetApp tries to delete from AsSessionWithQoS API has an invalid subscription id

* Pre-Conditions:
    1. The NetApp sends a subscription id which is not associated with a subscription in the db
    2. Subscription id is a valid uuid (24-character hex string) 
    3. NetApp is authorised, i.e., has an active OAuth2 token
    
* Actions:
    1. Netapp sends an HTTP DELETE request to AsSessionWithQoS API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    
* Post-Conditions:
    1. 404 Not Found

## ⛔ Test case 15: Delete individual subscription by unAuthorized NetApp

This test case will check that an unauthorised NetApp cannot retrieve an individual subscription from the AsSessionWithQoS API

* Pre-Conditions:
    1. NetApp is NOT authorised 

* Actions:
    1. Netapp sends an HTTP DELETE request to AsSessionWithQoS API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-as-session-with-qos/{scsAsId}/subscriptions/{subscriptionid}**</kbd> 
    
* Post-Conditions:
    1. 401 Unauthorized

[request body]: ./request.json
[response body]: ./response.json
