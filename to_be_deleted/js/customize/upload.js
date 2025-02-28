let upload_button = document.createElement("input");

upload_button.id = "upload_button";
upload_button.value = "Upload";
upload_button.type = "button";
upload_button.size = "10";


upload_button.addEventListener("click", () => {
	alert("Upload function is underdeveloping! HaHa!")
})

// let button_body = document.getElementsByTagName("body")[0];
let footer_inner = document.getElementsByClassName("footer-inner")[0];

footer_inner.prepend(upload_button);
