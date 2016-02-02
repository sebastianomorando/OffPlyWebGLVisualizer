if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}

function handleFileSelect(evt) 
{
  var input = event.target;
  var files = document.getElementById('files').files;
  if (!files.length) 
  {
    alert('Please select a file!');
    return;
  }
  var file = files[0];

  var reader = new FileReader();

  reader.onloadend = function(evt) 
  {
    if (evt.target.readyState == FileReader.DONE) // DONE == 2
    { 
      var text = reader.result;
      handleLoadedModel(text);
      initBuffers();
    }
  };
  reader.readAsText(file);
      
}

 