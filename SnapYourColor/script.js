$(document).ready(function() {
	initText();
});

var WELCOME_TEXT = "Welcome to Snap Your Color </br></br></br> Press START to take a picture of your desired color. </br> Afterwards you get the RGB and HEX values of your color. </br> You can also change the brightness of the color using the slider below the values.";
var WELCOME_TEXT_MOBILE = "Welcome to Snap Your Color Mobile! </br></br></br> Press START to take a picture of your desired color. </br> Afterwards you get the RGB and HEX values of your color. </br> You can also change the brightness of the color using the slider by turning your phone.";

// using WURFL to distinguish between desktop and mobile devices
function chooseStylesheet() {
	var fileref = document.createElement("link");
	fileref.setAttribute("rel", "stylesheet");
	fileref.setAttribute("type", "text/css");

	if (WURFL.is_mobile) {
    	fileref.setAttribute("href", "style_mobile.css");
	} else {
		fileref.setAttribute("href", "style.css");
	}

	// load CSS
	document.getElementsByTagName("head")[0].appendChild(fileref);
}

// init the welcome text dependening on device type
function initText() {
	// using WURFL to decide which welcome text to show
	if (WURFL.is_mobile === true && WURFL.form_factor === "Smartphone") {
    	$("#introduction").html(WELCOME_TEXT_MOBILE);
	} else {
		$("#introduction").html(WELCOME_TEXT);
	}
}

// ----------- Events -----------

function startCameraStreaming() {
	var video = document.getElementById('video');

	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {	    
		navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
		    video.src = window.URL.createObjectURL(stream);
		    video.play();
	    }, errorCallback);
	}

}

function setSliderEventListener() {
	var slider = document.getElementById("slider");
	slider.oninput = function() {
		updateColorValues();
	}
}

function setAccelerometerEventListener() {
	if (window.DeviceOrientationEvent) {

		window.addEventListener("deviceorientation", function(event) 
		{			
			// getting gamma value from accelerometer
			var xValue = Math.round(event.gamma);

			// update slider value and color 
			var slider = document.getElementById("slider");
			currentSliderValue = parseInt(slider.value);

			if(xValue < -5 && currentSliderValue > 0) {
				slider.value = currentSliderValue - 1;
			} else if (xValue > 5 && currentSliderValue < 1000) {
				slider.value = currentSliderValue + 1;
			}

			updateColorValues();
			
		}, true);		
		
	} else {		
		alert("Accelerotmeter not available to control the slider.");
	}
}

function errorCallback() {
	alert("You have to allow the camera use first!");
	$("#cameraView").fadeOut();
	$("#startView").fadeIn();
}

// **************** Main functionality ******************

function showCameraView() {
	$("#startView").css("display", "none");
	startCameraStreaming();
	$("#cameraView").fadeIn();
}

function captureImage() {	
	// capture image
	var rgb = takeSnapshot();

	// update values on screen
	setResultValues(rgb, true);	

	// switch views
	$("#cameraView").css("display", "none");
	$("#resultView").fadeIn();

	// set event listener
	setAccelerometerEventListener();
	setSliderEventListener();
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

function updateColorValues() {
	// update color brightness
	var color = $("#resultColorStore").html();
	var slider = document.getElementById("slider");
	var rbgColorArray = color.split("_");

	var r = parseInt(rbgColorArray[0]);
	var g = parseInt(rbgColorArray[1]);
	var b = parseInt(rbgColorArray[2]);
		
	var hsv = RGBtoHSV(r, g, b);
	hsv.v = slider.value / 1000;
	var rgb = HSVtoRGB(hsv);

	setResultValues(rgb, false);
}

function setResultValues(rgb, storeColor) {
	$("#resultColor").css("background-color", "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");	
	$("label").css("background-color", "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");
	$("#rgbOutput").val(rgb.r + ", " + rgb.g + ", " + rgb.b);
	$("#hexOutput").val(rgbToHex(rgb.r, rgb.g, rgb.b));

	// store the origin color to apply brightness updates on it
	if(storeColor) {
		$("#resultColorStore").html(rgb.r + "_" + rgb.g + "_" + rgb.b);

		// set slider to initial brightness value
		var hsv = RGBtoHSV(rgb.r, rgb.g, rgb.b);
		var newValue = hsv.v * 1000;
		var slider = document.getElementById("slider");
		slider.value = parseInt(newValue);
	}	
}

// ------------- Utils for brightness change ----------
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

function RGBtoHSV(r, g, b) {
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
