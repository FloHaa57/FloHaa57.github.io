$(document).ready(function() {

	setAmbientLightEventListener();
	setAccelerometerEventListener();
	startCameraStreaming();

});

function startCameraStreaming() {

	var video = document.getElementById('video');

	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {	    
		navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
		    video.src = window.URL.createObjectURL(stream);
		    video.play();
	    }, errorCallback);
	}

}

function setAmbientLightEventListener() {

		window.addEventListener("devicelight", function (light) {
    		var ambientlight = light.value;
    		$("#ambient_light").html("Ambient-Light in lux: " + ambientlight);
		});

}	

function setAccelerometerEventListener() {

	if (window.DeviceOrientationEvent) {

		window.addEventListener("deviceorientation", function(event) 
		{
			
			var xValue = Math.round(event.gamma);
			var yValue = Math.round(event.beta);
			var rotation = Math.round(event.alpha);

			$("#accelerotmeter").html("X: " + xValue + ", Y: " + yValue + ", Rotation: " + rotation);
			
		}, true);		
		
	} else {		
		writeMessage("Accelerotmeter not available");
	}
}

function takeSnapshot() {
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var video = document.getElementById('video');

	document.getElementById("snapButton").addEventListener("click", function() {
		context.drawImage(video, 0, 0, 700, 480);
	});
}

function errorCallback() {
	writeMessage("Failed to show camera stream");
}

function writeMessage(message) {
	var msgs = $("#messagBox").text();
	msgs = msgs + "<br/>" + message;
	$("#messagBox").html(msgs);
}