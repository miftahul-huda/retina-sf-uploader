# Retina SF Uploader
Web Application to process SF data upload. This includes frontend and backend (REST).

### Environment Variables:

PROJECT:  
APPLICATION_TITLE: Retina SF Uploader  
APPLICATION_PORT: 8080 
DBHOST:   
DBNAME:   
DBUSER:    
DBPASSWORD:   
DBENGINE:    
AUTH_DBHOST:   
AUTH_DBNAME:    
AUTH_DBUSER:    
AUTH_DBPASSWORD:   
AUTH_DBENGINE: postgresql  
PUBSUB_UPLOAD_XLS_DONE: projects/telkomsel-retail-intelligence/topics/uploaded-xls-done-dev  
PUBSUB_CONVERT_XLS_CSV_DONE: projects/telkomsel-retail-intelligence/topics/convert-xls-csv-done-dev 
PUBSUB_SAVE_STORE_USER_TEMP_DONE: projects/telkomsel-retail-intelligence/topics/save-store-user-temp-done-dev  
PUBSUB_PROCESS_STORE_USER_TEMP_DONE: projects/telkomsel-retail-intelligence/topics/process-store-user-temp-done-dev 
PUBSUB_TRANSFER_FROM_TEMPORARY_DONE: projects/telkomsel-retail-intelligence/topics/transfer-from-temporary-done-dev 

### How to run:
```
node app.js
```
It will run using port 8080 (defined in Environment Variables)

To open the web:
```
http://localhost:8080
```
### REST API

There are some REST APIs used by frontend:

1. Get user list
```
/user?offset=<offset>&limit=<limit> 
```
It returns list of users with specified offset and limit.
Example:
```
http://localhost:8080/user?offset=0&limit10
```
will return first 10 data of users

2. Search user by keyword
```
/user/find?keyword=<keyword>offset=<offset>&limit=<limit> 
```
It returns list of users with specified offset and limit.
Example:
```
http://localhost:8080/user/find?keyword=tester&offset=0&limit10
```
will return first 10 data of users

3. Get User Outlets
```
/user/<user>/outlets
```
It returns list of outlets that must be surveyed by the user.
Example:
```
http://localhost:8080/user/user.tester/outlets
```
It will return all the outlets user.tester should visits.



