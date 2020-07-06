import { execute, skip, stop } from "./music.js"

export default [
	{
		name: "song",
		callback: execute
	},
	{
		name: "skip",
		callback: skip
	},
	{
		name: "stop",
		callback: stop
	}
]