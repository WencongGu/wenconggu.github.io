// <p style="font-family:'clicker script','segoe script','Comic Sans MS'; font-size:28px">"life,love,linux"</p>

let p = document.createElement("p");

p.style = "font-family:'clicker script','segoe script','Comic Sans MS'; font-size:28px";

p.innerHTML = "May everything goes fine and well:)";

let footer_inner = document.getElementsByClassName("footer-inner")[0];

footer_inner.prepend(p);