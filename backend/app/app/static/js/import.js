// ===============================================
//               Global variables
// ===============================================
var cm                = null;  // codemirror
var scenario_json_str = "";




// ===============================================
//                 Document ready
// ===============================================
$( document ).ready(function() {

  cm = CodeMirror.fromTextArea( document.getElementById("import_text_area"),
    {
      lineNumbers : true,
      mode        : "javascript"
    }
  );

  $(".CodeMirror").css("font-size",11);
  // cm.refresh();
  
  

  $('#import-btn-save').on('click', function(){
    // check textarea is empty
    scenario_json_str = cm.getValue();

    if (scenario_json_str.length == 0 ) {
      ui_display_toast_msg("warning", "Oups!", "Make sure you add some json first!");
    }
    else {
      api_import_scenario( scenario_json_str );
    }
  });

});



function api_import_scenario( data_json_str ) {
    
    var url = app.api_url + '/utils/import/scenario';

    $.ajax({
        type: 'POST',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        data:         data_json_str,
        processData:  false,
        beforeSend: function() {
            //
        },
        success: function(data)
        {
          ui_display_toast_msg("success", "Finished!", "Successfully imported the scenario.");
        },
        error: function(err)
        {
            console.log(err);
            ui_display_toast_msg("error", "Oups!", "The scenario could not be imported.");
        },
        complete: function()
        {
            //
        },
        timeout: 30000
    });
}




function ui_display_toast_msg( type, title, text ) {
    toastr_options = {
        closeButton     : true,
        positionClass   : "toast-bottom-right",
        // timeOut         : 0,
        // extendedTimeOut : 0
    };
    toastr[type](text, title, toastr_options);
}
