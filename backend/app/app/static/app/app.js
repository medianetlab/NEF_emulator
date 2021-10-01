// 
// This .js file is intended to be used by all pages of the app.
// Functionality:
//   - check local storage:
//       - if no bearer token is found --> redirect to unauthorized page
//       - if    bearer token is found --> test its validity
//   - if local storage has valid token, continue rendering the page
// 


// ================== Global variables ==================

var app = {
    local_storage_available = false,
    auth_obj = null
};

// ======================================================




$( document ).ready(function() {
    // check if local storage is available
    // updates `local_storage_available` variable
    test_local_storage();

    if (local_storage_available) {
        auth_obj = JSON.parse(localStorage.getItem('bearer-token'));
    }

});





// ================== Functions Area ==================
// 
function test_local_storage(){
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        local_storage_available = true;
    } catch(e) {
        local_storage_available = false;
    }
}



// ================== Ajax Calls Area ==================
//

function test_token(){

}