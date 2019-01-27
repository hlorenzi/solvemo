import { PuzzleEditor } from "./puzzleEditor.js"


let gEditor = null


document.body.onload = function()
{
	gEditor = new PuzzleEditor(document.getElementById("canvasMain"))
	
	document.getElementById("buttonModePaint").onclick = () => gEditor.setMode("paint")
	document.getElementById("buttonModeDebug").onclick = () => gEditor.setMode("debug")
	
	document.getElementById("buttonPaintErase").onclick = () => gEditor.paintColor = -1
	for (let i = 0; i < 10; i++)
	{
		let c = i
		document.getElementById("buttonPaintColor" + i).onclick = () => gEditor.paintColor = c
		document.getElementById("buttonPaintColor" + i).innerHTML = "<div style='background-color:" + gEditor.blockColors[i] + "; width:1em; height:1em;'></div>"
	}
	
	const urlData = getURLQueryParameter("puzzle")
	if (urlData != null)
		gEditor.loadFromString(urlData)
	
	const saveToURL = () =>
	{
		let urlWithoutQuery = [location.protocol, "//", location.host, location.pathname].join("")
		window.location = urlWithoutQuery + "?puzzle=" + gEditor.saveToString()
	}
}


function getURLQueryParameter(name)
{
	const url = window.location.search
	
	name = name.replace(/[\[\]]/g, "\\$&")
	
	const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
	const results = regex.exec(url)
	
	if (!results)
		return null
	
	if (!results[2])
		return ""
	
	return decodeURIComponent(results[2].replace(/\+/g, " "))
}