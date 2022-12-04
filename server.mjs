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

import { randomUUID } from "crypto"
import express from "express"
import fs from "fs"
import https from "https"

const pem = { key: fs.readFileSync("etc/key.pem"), cert: fs.readFileSync("etc/cert.pem") }
const app = express()
const dir = "www"
const port = 3033

let dict = new Map()
app.use(express.static(dir))
app.use("/new/:min/:max/:try", (req, res) => {
	const max = parseInt(req.params.max)
	const min = parseInt(req.params.min)
	const rem = parseInt(req.params.try)
	const uid = randomUUID()
	const num = Math.floor(Math.random() * (max - min + 1)) + min
	dict.set(uid, { num, rem })
	res.json({ uid, rem })
	process.stdout.write(`{ uid: ${uid}, answer: ${num}, chance: ${rem} }\n`)
})
app.use("/guess/:uid/:number", (req, res) => {
	const uid = req.params.uid
	if (dict.get(uid) === undefined) {
		res.status(404).json({ rem: -1 })
		console.log({ uid })
		return
	}
	const num = dict.get(uid).num
	const rem = dict.get(uid).rem - 1
	const gss = Number(req.params.number)
	const eq = gss === num
	const lt = gss < num
	const gt = gss > num
	eq || rem == 0 ? dict.delete(uid) : dict.set(uid, { num, rem })
	res.json({ eq, lt, gt, rem, answer: eq || rem == 0 ? num : null })
	process.stdout.write(`{ uid: ${uid}, answer: ${num}, chance: ${rem}, guess: ${gss} }\n`)
})
https.createServer(pem, app).listen(port, () => console.log(`Server running at https://localhost:${port}/\n`))
