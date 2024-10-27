import "./time_display.js";
// import "./vercel.js";
// import "./upload.js";

if (window.location.hostname != "wenconggu.github.io") {
	import("./vercel.js");
} else {
	import("./upload.js")
}
// alert(window.location.hostname=="localhost");

// alert("main.js here");

