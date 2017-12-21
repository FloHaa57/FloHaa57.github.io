$(document).ready(function() {

	/* ambient light event listener */
	window.addEventListener("devicelight", function (light) {
    var ambientlight = light.value;
    $("#ambient_light").html(ambientlight);
	});

	/* check camera availability */
	if (hasGetUserMedia()) {

		 var video = document.querySelector('video');

		//  navigator.mediaDevices.getUserMedia({audio: false, video: true}, function(stream) {
		//	video.src = window.URL.createObjectURL(stream);
		//}, errorCallback);

		navigator.getUserMedia('video, audio', function(localMediaStream) {
	    	video.src = window.URL.createObjectURL(localMediaStream);

	    	// Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
	    	// See crbug.com/110938.
	    	video.onloadedmetadata = function(e) {
	      // Ready to go. Do some stuff.
	    	};
	  	}, errorCallback);

	} else {
  		alert('getUserMedia() is not supported in your browser');
	}
});	

function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

function errorCallback() {
	alert("Error loading video...");
}