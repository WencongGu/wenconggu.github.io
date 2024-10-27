let waline_css = document.createElement("link");
let waline_div = document.createElement("div");
let waline_script = document.createElement("script");

let waline_to_head = document.getElementsByTagName("head")[0];
let waline_to_body = document.getElementsByTagName('body')[0];

waline_css.rel = "stylesheet";
waline_css.href = "https://unpkg.com/@waline/client@v3/dist/waline.css";
waline_to_head.append(waline_css);

waline_div.id = "waline";
waline_to_body.append(waline_div);

waline_script.type = "module";
waline_script.innerHTML = `
	import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';

    init({
      el: '#waline',
      serverURL: 'https://wenconggu-github-io.vercel.app',
    });
`;
waline_to_body.append(waline_script);
