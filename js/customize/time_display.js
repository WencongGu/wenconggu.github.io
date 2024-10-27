// <span id="Welcome">Hello... :-)</span>
// <span id="timeDate">Time Calculating...</span>

// {{- next_inject('footer') }}
// <!-- 网站运行时间的设置 -->
// <script src="/js/customise.js"></script>

let welcome = document.createElement("span");
let timeDate = document.createElement("span");

welcome.id = "Welcome";
welcome.innerHTML = 'Hello... :-)';

timeDate.id = "timeDate";
timeDate.innerHTML = 'Time Calculating...';

let footer_inner = document.getElementsByClassName("footer-inner")[0];

footer_inner.append(welcome);
footer_inner.append(timeDate);

const now = new Date();
function createtime() {
	const grt = new Date("05/06/2023 00:00:00"); //此处修改你的建站时间或者网站上线时间
	now.setTime(now.getTime() + 250);
	let days = (now - grt) / 1000 / 60 / 60 / 24;
	let dnum = Math.floor(days);
	let hours = (now - grt) / 1000 / 60 / 60 - (24 * dnum);
	let hnum = Math.floor(hours);
	if (String(hnum).length == 1) {
		hnum = "0" + hnum;
	}
	let minutes = (now - grt) / 1000 / 60 - (24 * 60 * dnum) - (60 * hnum);
	let mnum = Math.floor(minutes);
	if (String(mnum).length == 1) {
		mnum = "0" + mnum;
	}
	let seconds = (now - grt) / 1000 - (24 * 60 * 60 * dnum) - (60 * 60 * hnum) - (60 * mnum);
	let snum = Math.round(seconds); if (String(snum).length == 1) { snum = "0" + snum; }
	welcome.innerHTML = "交个朋友吧～ :-)<br>Let's be friends! :D"
	timeDate.innerHTML = "Started: " + dnum + " d " + hnum + " h " + mnum + " m " + snum + " s ago.";
}
setInterval(createtime, 250);