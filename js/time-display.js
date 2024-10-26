const now = new Date();
function createtime() {
	const grt = new Date("05/06/2023 00:00:00"); //此处修改你的建站时间或者网站上线时间
	now.setTime(now.getTime() + 250);
	days = (now - grt) / 1000 / 60 / 60 / 24; dnum = Math.floor(days);
	hours = (now - grt) / 1000 / 60 / 60 - (24 * dnum); hnum = Math.floor(hours);
	if (String(hnum).length == 1) { hnum = "0" + hnum; } minutes = (now - grt) / 1000 / 60 - (24 * 60 * dnum) - (60 * hnum);
	mnum = Math.floor(minutes); if (String(mnum).length == 1) { mnum = "0" + mnum; }
	seconds = (now - grt) / 1000 - (24 * 60 * 60 * dnum) - (60 * 60 * hnum) - (60 * mnum);
	snum = Math.round(seconds); if (String(snum).length == 1) { snum = "0" + snum; }
	document.getElementById("Welcome").innerHTML = "交个朋友吧～ :-)<br>Let's be friends! :D"
	document.getElementById("timeDate").innerHTML = "Started: " + dnum + " d " + hnum + " h " + mnum + " m " + snum + " s ago.";
}
setInterval("createtime()", 250);