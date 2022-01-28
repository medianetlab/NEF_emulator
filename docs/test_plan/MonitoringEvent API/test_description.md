# Functional Tests for NEF Emulator / Northbound APIs

## Test Plan for Monitoring Event API

### Tests for HTTP POST Method
* Test Case 1: Create subscription by Authorized NetApp
* Test Case 2: One-time request to the Monitoring Event API by Authorized NetApp
* Test Case 3: Create subscription when there is already an active subscription for a registered UE
* Test Case 4: Create subscription by unAuthorized NetApp

### Tests for HTTP GET Method
* Test Case 5: Read all active subscriptions by Authorized NetApp 
* Test Case 6: Read all active subscriptions by Authorized NetApp (no active subscriptions available)
* Test Case 7: Read individual subscription by Authorized NetApp
* Test Case 8: Read individual subscription by Authorized NetApp with invalid subscription id
* Test Case 9: Read all active subscriptions by unAuthorized NetApp 
* Test case 10: Read individual subscription by unAuthorized NetApp

### Tests for HTTP PUT Method
* Test Case 11: Update individual subscription by Authorized NetApp
* Test Case 12: Update individual subscription by Authorized NetApp with invalid subscription id
* Test case 13: Update individual subscription by unAuthorized NetApp

### Tests for HTTP DELETE Method
* Test Case 14: Delete individual subscription by Authorized NetApp
* Test Case 15: Delete individual subscription by Authorized NetApp with invalid subscription id
* Test case 16: Delete individual subscription by unAuthorized NetApp


## ✔ Test Case 1: Create subscription by Authorized NetApp

This test case will check that the NetApp creates a subscription successfully to the Monitoring Event API for a registered UE

* Pre-Conditions:
    1. The UE exists in the DB
    2. NetApp subscribes to the Monitoring Event API for a UE that has not an active subscription (in DB)
    3. Monitoring request is a non one-time reporting request 👉(maximum number of reports field on the request body is greater than 1)
    4. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp subscribes to Monitoring Event API with an HTTP POST request for a registered UE
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions**</kbd>
    3. Request Body
    
* Post-Conditions:
    1. 201 Created response
    2. Response body
    3. The URI of the created resource is returned in the 'Location' HTTP header  according to the structure: 
<kbd>**{apiRoot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions/{subscriptionId}**</kbd>

## ✔ Test Case 2: One-time request to the Monitoring Event API by Authorized NetApp

This test case will check that the NetApp sends an one-time response request to the Monitoring Event API for a registered UE

* Pre-Conditions:
    1.  The UE exists in the DB
    2.  Monitoring request is a one-time reporting request 👉(maximum number of reports field on the request body equals to 1)
    3.  NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp sends an HTTP POST request to Monitoring Event API
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions**</kbd>
    3. Request Body
    
* Post-Conditions:
    1. 200 OK response
    2. Response body

## ❌ Test Case 3: Create subscription when there is already an active subscription for a registered UE

This test case will check that whether the NetApp tries to subscribe to the Monitoring Event API for a registered UE, that has an active subscription, the request is rejected.

* Pre-Conditions:
    1. The UE exists in the DB
    2. There is already an active subscription associated with this UE
    3. Monitoring request is a non one-time reporting request (more info)
    4. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp subscribes to Monitoring Event API with an HTTP POST request for a registered UE
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions**</kbd>
    3. Request Body
    
* Post-Conditions:
    1. 409 Conflict / There is already an active subscription for UE with external id '*externalId*'

## ⛔ Test Case 4: Create subscription by unAuthorized NetApp

This test case will check that an unauthorised NetApp cannot create a subscription to the Monitoring Event API

* Pre-Conditions:
    1. NetApp is NOT authorised 

* Actions:
    1. Netapp subscribes to Monitoring Event API with an HTTP POST request
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions**</kbd> 
    3. Request Body
    
* Post-Conditions:
    1. 401 Unauthorized

## ✔ Test Case 5: Read all active subscriptions by Authorized NetApp 

This test case will check if the active subscriptions are retrieved successfully by the NetApp from the Monitoring Event API

* Pre-Conditions:
    1. There is at least one active subscription associated with this NetApp in the db
    2. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp sends an HTTP GET request to Monitoring Event API
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions**</kbd>
    
* Post-Conditions:
    1. 200 OK response 
    2. A list with the retrieved subscriptions 


## ✔ Test Case 6: Read all active subscriptions by Authorized NetApp (no active subscriptions available)

This test case will check if there are no active subscription to be retrieved by the NetApp from the Monitoring Event API

* Pre-Conditions:
    1. There are no active subscription associated with this NetApp in the db
    2. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp sends an HTTP GET request to Monitoring Event API
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions**</kbd>
    
* Post-Conditions:
    1. 204 No Content 

## ✔ Test Case 7: Read individual subscription by Authorized NetApp

This test case will check if the individual subscription by the NetApp from Monitoring Event API is sucessfully retrieved

* Pre-Conditions:
    1. There is one active subscription associated with the NetApp with a unique subscription id
    2. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp sends an HTTP GET request to Monitoring Event API
    2. Netapp provides in the request the path parameter {subscriptionid}, which initially retrieved in the creation of the subscription
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    
* Post-Conditions:
    1. 200 OK response 
    2. Response body

## ❌ Test Case 8: Read individual subscription by Authorized NetApp with invalid subscription id
This test case will check if the individual subscription retrieved by the NetApp from Monitoring Event API has an invalid subscription id

* Pre-Conditions:
    1. The NetApp sends a subscription id which is not associated with a subscription in the db 
    2. NetApp is authorised, i.e., has an active OAuth2 token
    
* Actions:
    1. Netapp sends an HTTP GET request to Monitoring Event API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    
* Post-Conditions:
    1. 404 Not Found

## ⛔ Test Case 9: Read all active subscriptions by unAuthorized NetApp

This test case will check that an unauthorised NetApp cannot retrieve all active subscriptions from the Monitoring Event API

* Pre-Conditions:
    1. NetApp is NOT authorised 

* Actions:
    1. Netapp sends an HTTP GET request to Monitoring Event API
    2. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions**</kbd> 
    
* Post-Conditions:
    1. 401 Unauthorized

## ⛔ Test case 10: Read individual subscription by unAuthorized NetApp

This test case will check that an unauthorised NetApp cannot retrieve an individual subscription from the Monitoring Event API

* Pre-Conditions:
    1. NetApp is NOT authorised 

* Actions:
    1. Netapp sends an HTTP GET request to Monitoring Event API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions/{subscriptionid}**</kbd> 
    
* Post-Conditions:
    1. 401 Unauthorized

## ✔ Test Case 11: Update individual subscription by Authorized NetApp

This test case will check if the individual subscription by the NetApp from Monitoring Event API is sucessfully updated

* Pre-Conditions:
    1. There is one active subscription associated with the NetApp with a unique subscription id
    2. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp sends an HTTP PUT request to Monitoring Event API
    2. Netapp provides in the request the path parameter {subscriptionid}, which initially retrieved in the creation of the subscription
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    4. Request body
    
* Post-Conditions:
    1. 200 OK response 
    2. Response body

## ❌ Test Case 12: Update individual subscription by Authorized NetApp with invalid subscription id

This test case will check if the individual subscription that the NetApp tries to update from Monitoring Event API has an invalid subscription id

* Pre-Conditions:
    1. The NetApp sends a subscription id which is not associated with a subscription in the db 
    2. NetApp is authorised, i.e., has an active OAuth2 token
    
* Actions:
    1. Netapp sends an HTTP PUT request to Monitoring Event API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    4. Request body

* Post-Conditions:
    1. 404 Not Found
    
## ⛔ Test case 13: Update individual subscription by unAuthorized NetApp

This test case will check that an unauthorised NetApp cannot update an individual subscription from the Monitoring Event API

* Pre-Conditions:
    1. NetApp is NOT authorised 

* Actions:
    1. Netapp sends an HTTP PUT request to Monitoring Event API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions/{subscriptionid}**</kbd> 
    4. Request body
    
* Post-Conditions:
    1. 401 Unauthorized

## ✔ Test Case 14: Delete individual subscription by Authorized NetApp

This test case will check if the individual subscription by the NetApp from Monitoring Event API is sucessfully deleted

* Pre-Conditions:
    1. There is one active subscription associated with the NetApp with a unique subscription id
    2. NetApp is authorised, i.e., has an active OAuth2 token

* Actions:
    1. Netapp sends an HTTP DELETE request to Monitoring Event API
    2. Netapp provides in the request the path parameter {subscriptionid}, which initially retrieved in the creation of the subscription
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    
* Post-Conditions:
    1. 200 OK response 
    2. Response body

## ❌ Test Case 15: Delete individual subscription by Authorized NetApp with invalid subscription id

This test case will check if the individual subscription that the NetApp tries to delete from Monitoring Event API has an invalid subscription id

* Pre-Conditions:
    1. The NetApp sends a subscription id which is not associated with a subscription in the db 
    2. NetApp is authorised, i.e., has an active OAuth2 token
    
* Actions:
    1. Netapp sends an HTTP DELETE request to Monitoring Event API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions/{subscriptionid}**</kbd>
    
* Post-Conditions:
    1. 404 Not Found

## ⛔ Test case 16: Delete individual subscription by unAuthorized NetApp

This test case will check that an unauthorised NetApp cannot retrieve an individual subscription from the Monitoring Event API

* Pre-Conditions:
    1. NetApp is NOT authorised 

* Actions:
    1. Netapp sends an HTTP DELETE request to Monitoring Event API
    2. Netapp provides in the request the path parameter {subscriptionid}
    3. Endpoint: <kbd>**{apiroot}/nef/api/v1/3gpp-monitoring-event/{scsAsId}/subscriptions/{subscriptionid}**</kbd> 
    
* Post-Conditions:
    1. 401 Unauthorized
