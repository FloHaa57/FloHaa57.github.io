var originRGB;

$(document).ready(function() {

	setAmbientLightEventListener();
	setAccelerometerEventListener();
	//startCameraStreaming();
	setSliderEventListener();
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

			// update slider value
			var slider = document.getElementById("slider");

			if(xValue < -5) {
				slider.value -= 1;
			} else if (xValue > 5) {
				slider.value += 1;
			}
			
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
	originRGB = rgb;

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

function setSliderEventListener() {
	var slider = document.getElementById("slider");
	slider.oninput = function() {
		// update color brightness
		alert(originRGB);
	}
}

/*
function startStream() {
	MediaStreamTrack.getSources(function(sourceInfos) {
	  var audioSource = null;
	  var videoSource = null;

	  for (var i = 0; i != sourceInfos.length; ++i) {
	    var sourceInfo = sourceInfos[i];
	    if (sourceInfo.kind === 'audio') {
	      console.log(sourceInfo.id, sourceInfo.label || 'microphone');

	      audioSource = sourceInfo.id;
	    } else if (sourceInfo.kind === 'video') {
	      console.log(sourceInfo.id, sourceInfo.label || 'camera');

	      videoSource = sourceInfo.id;
	    } else {
	      console.log('Some other kind of source: ', sourceInfo);
	    }
	  }

	  sourceSelected(audioSource, videoSource);
	});
}

function sourceSelected(audioSource, videoSource) {
  var constraints = {
    audio: {
      optional: [{sourceId: audioSource}]
    },
    video: {
      optional: [{sourceId: videoSource}]
    }
  };

  navigator.getUserMedia(constraints, successCallback, errorCallback);
}

function successCallback() {
	var video = document.getElementById('video');
	video.src = window.URL.createObjectURL(stream);
	video.play()
}
*/

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return {
  	h: h,
  	s: s,
  	v : v
  };
}