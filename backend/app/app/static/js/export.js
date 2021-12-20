// ===============================================
//               Global variables
// ===============================================
var cm                = null;  // codemirror
var scenario_json     = null;
var scenario_json_str = "";




// ===============================================
//                 Document ready
// ===============================================
$( document ).ready(function() {

  cm = CodeMirror.fromTextArea( document.getElementById("export_text_area"),
    {
      lineNumbers : true,
      mode        : "javascript"
    }
  );

  $(".CodeMirror").css("font-size",11);
  // cm.refresh();
  
  api_get_scenario();
  // api_get_scenario(function(data){
  //   $('#scenario_json').html( JSON.stringify(data, null, 2) );
  //   hljs.highlightAll();
  // });

  $('#export-btn-copy').on('click', function(){
    copyTextToClipboard( scenario_json_str );
  });
});



function api_get_scenario() {
    
    var url = app.api_url + '/utils/export/scenario';

    $.ajax({
        type: 'GET',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        processData:  false,
        beforeSend: function() {
            // $('.card-gNBs .spinner-grow-sm').show();
        },
        success: function(data)
        {
          scenario_json     = data;
          scenario_json_str = JSON.stringify(data, null, 2)
          cm.setValue( scenario_json_str );
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            // $('.card-gNBs .spinner-grow-sm').hide();
        },
        timeout: 15000
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


// ==================================================================================================
// code from: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
    ui_display_toast_msg("error", "Oups!", "Could not copy to clipboard.");
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
    ui_display_toast_msg("success", "Copied!", "Successfully copied to clipboard.");
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
    ui_display_toast_msg("error", "Oups!", "Could not copy to clipboard.");
  });
}
// ==================================================================================================