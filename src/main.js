/*
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

import "@/main.pcss"
import "@/font.css"

const server = "https://localhost:3033"

async function checkguess() {
	const guess_number = document.querySelector("#guess_number")
	const guess_list = document.querySelector("#guess_list")
	const guess_last = document.querySelector("#guess_last")
	const guess_hint = document.querySelector("#guess_hint")
	const guess_this = Number(guess_number.value)
	const res = await fetch(`${server}/guess/${uid}/${guess_this}`).then((r) => r.json())

	if (res.rem < 0 || res.status === 404) {
		alert(`Server refused: unknown ${res.rem < 0 ? "token" : "error"}. The game will try to restart.`)
		await startgame()
		return
	}
	count++
	if (count === 1) guess_list.textContent = "Previous guesses:"
	guess_list.textContent += ` ${guess_this}`

	if (res.eq) {
		guess_last.textContent = "Congratulations! You got it right!"
		guess_last.style.backgroundColor = "green"
	} else if (res.rem == 0) {
		guess_last.textContent = "!!!GAME OVER!!!"
		if (res.answer) guess_last.textContent += ` The answer is ${res.answer}.`
	} else {
		guess_last.textContent = "Wrong!"
		guess_last.style.backgroundColor = "red"
		if (res.lt) guess_hint.textContent = "Last guess was too low!"
		if (res.gt) guess_hint.textContent = "Last guess was too high!"
		guess_number.value = null
		guess_number.focus()
		return
	}
	guess_number.value = null
	guess_hint.textContent = null
	await setgameover()
}

async function setgameover() {
	const guess_submit = document.querySelector("#guess_submit")
	const guess_number = document.querySelector("#guess_number")

	guess_submit.disabled = true
	guess_number.disabled = true
	const button = document.createElement("button")
	button.type = "button"
	button.textContent = "Start new game"
	document.querySelector("#result").appendChild(button)
	button.addEventListener("click", startgame)
	const reload = document.createElement("button")
	reload.type = "button"
	reload.textContent = "Reselect level"
	document.querySelector("#result").appendChild(reload)
	reload.addEventListener("click", () => location.reload())
}

async function startgame() {
	const result = document.querySelectorAll("#result>p")
	const button = document.querySelectorAll("#result>button")
	const guess_last = document.querySelector("#guess_last")
	const guess_submit = document.querySelector("#guess_submit")
	const guess_number = document.querySelector("#guess_number")
	const response = await fetch(`${server}/new/${conf.min}/${conf.max}/${conf.chance}`).then((r) => r.json())
	uid = response.uid
	count = 0

	for (const p of result) p.textContent = null
	for (const b of button) b.parentNode.removeChild(b)
	guess_submit.disabled = false
	guess_number.disabled = false
	guess_number.value = null
	guess_number.focus()
	guess_last.style.backgroundColor = null
}

function init(o) {
	const info = document.querySelector("#info1>p")
	info.textContent = info.textContent.replace(/-?\d+ and -?\d+/, `${o.min} and ${o.max}`).replace(/in \d+/, `in ${o.chance}`)
	document.querySelector("#info0").hidden = true
	document.querySelector("#info1").hidden = false
	document.querySelector("#guess").hidden = false
	document.querySelector("#guess_number").min = o.min
	document.querySelector("#guess_number").max = o.max
	conf = o
	startgame()
}

let uid
let conf
let count
document.querySelector("#lv1").addEventListener("click", () => init({ min: 1, max: 100, chance: 10 }))
document.querySelector("#lv2").addEventListener("click", () => init({ min: 1, max: 1000, chance: 12 }))
document.querySelector("#lv3").addEventListener("click", () => init({ min: 1, max: 10000, chance: 15 }))
document.querySelector("#lv0").addEventListener("click", () => {
	const min = parseInt(prompt("Please input the minimum", 1))
	const max = parseInt(prompt("Please input the maximum", 100))
	const chance = Math.abs(parseInt(prompt("Please input the number of chances", 10)))
	min < max ? init({ min, max, chance }) : init({ min: max, max: min, chance })
})
document.querySelector("form#guess").addEventListener("submit", (evnt) => {
	evnt.preventDefault()
	checkguess()
})
