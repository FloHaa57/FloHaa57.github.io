$(document).ready(function() {

	/* ambient light event listener */
	window.addEventListener("devicelight", function (light) {
    var ambientlight = light.value;
    $("#ambient_light").html(ambientlight);
	});

	/* check camera availability */
	if (hasGetUserMedia()) {

		 var video = document.querySelector('video');

		  navigator.mediaDevices.getUserMedia({audio: false, video: true}, function(stream) {
			video.src = window.URL.createObjectURL(stream);
		}, errorCallback);

	} else {
  		alert('getUserMedia() is not supported in your browser');
	}
});	

function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}