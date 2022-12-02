/*
 * Copyright (C) 2022 weatherwidget.org
 * Copyright (C) 2022 Heptazhou <zhou@0h7z.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

function get(url, cb, id, gen) {
	const request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP")
	request.onreadystatechange = () => {
		if (request.readyState === XMLHttpRequest.DONE && request.status === 200) cb(id, request.responseText, gen)
	}
	request.open("GET", url)
	request.send()
}
function post(url, cb, para, id) {
	const request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP")
	request.onreadystatechange = () => {
		if (request.readyState === XMLHttpRequest.DONE && request.status === 200) cb(request.responseText, id)
	}
	request.open("POST", url, true)
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
	request.send(para)
}
function api(id, i, gen) {
	const x = "https://weatherwidget.org/tr/"
	const y = "Hava Durumu Widget HTML"
	const z = `Web Sitesine <a href="${x}" id="${id}_u" target="_blank">${y}</a> Göm`
	const v = document.getElementById(id).getAttribute("v")
	const a = document.getElementById(id).getAttribute("a")
	const l = document.getElementById(id).getAttribute("loc")
	const u = x + "|||" + y
	const b = gen == 1 ? "" : z
	const g = gen
	const para = `v=${v}&a=${a}&l=${l}&u=${u}&ub=${b}&i=${i}&g=${g}&id=${id}`
	post("https://app1.weatherwidget.org/data/", update, para, id)
}
function query(id, gen) {
	if (document.getElementById(id).getAttribute("loc") === "auto") get("https://api.ipify.org/", api, id, gen)
	else api(id, false, gen)
}
function update(data, id) {
	data = typeof JSON.parse === "undefined" ? JSON.decode(data) : JSON.parse(data)
	if (data.hasOwnProperty("a")) {
		if (data.a.hasOwnProperty("html")) document.getElementById(id).innerHTML = data.a.html
		if (data.a.hasOwnProperty("style")) document.getElementById(id).style.cssText = data.a.style
		if (data.a.hasOwnProperty("jsCode")) {
			const script = document.createElement("script")
			script.type = "text/javascript"
			script.async = false
			script.text = data.a.jsCode
			document.getElementsByTagName("head")[0].appendChild(script)
		}
		if (data.a.hasOwnProperty("ub")) {
			document.getElementById(id + "_info_box_inner").innerHTML = data.a.ub
			updateInfobox(id, data.a.ub)
			loadingToggle(id, 2)
		}
	} else if (data.hasOwnProperty("error_code")) {
		document.getElementById(id).innerHTML = ""
		console.log(`[weatherwidget.org] Error: ${data.error_msg} (Error code ${data.error_code})`)
	}
}
function widget(id, gen) {
	if (gen === 1) loadingToggle(id, 1)
	query(id, gen)
}
widget("ww_a19f7d045f952", 0)
