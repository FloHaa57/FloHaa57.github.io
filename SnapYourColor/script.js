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
	var width = video.offsetWidth;
	var height = video.offsetHeight;
	canvas.width = width;
	canvas.height = height;
	context.drawImage(video, 0, 0, width, height);

	// getting image data
	var imageData = context.getImageData(0, 0, width, height).data;
	var rgb = calculateColor(imageData);

	return rgb;

	// printing image on canvas obj
	/*var image = new Image();
	image.onload = calculateColor(image);
	image.src = canvas.toDataURL("image/png");*/
}

function errorCallback() {
	writeMessage("Failed to show camera stream");
}

function writeMessage(message) {
	var msgs = $("#messagBox").text();
	msgs = msgs + "<br/>" + message;
	$("#messagBox").html(msgs);
}

function showCameraView() {
	$("#startView").fadeOut();
	$("#cameraView").fadeIn();
}

function captureImage() {

	// show loading view
	$("#cameraView").fadeOut();

	// capture image
	var rgb = takeSnapshot();

	$("#resultColor").css("background-color", "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");
	$("label").css("background-color", "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");
	$("#rgbOutput").val(rgb.r + ", " + rgb.g + ", " + rgb.b);
	$("#hexOutput").val(rgbToHex(rgb.r, rgb.g, rgb.b));

	$("#resultView").fadeIn();
}

function calculateColor(imageData) {	

	// iterate through pixels
	var dataLength = imageData.length;
	var i = 0;
	var pixelCount = 0;
	var rgb = {r:0, g:0, b:0};

	while ((i += 4) < dataLength) {
		++pixelCount;
		rgb.r += imageData[i];
		rgb.g += imageData[i+1];
		rgb.b += imageData[i+2];
	}

	rgb.r = Math.round(rgb.r / pixelCount);
	rgb.g =  Math.round(rgb.g / pixelCount);
	rgb.b =  Math.round(rgb.b / pixelCount);

	return rgb;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}