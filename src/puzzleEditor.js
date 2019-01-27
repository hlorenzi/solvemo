export class PuzzleEditor
{
	constructor(canvas)
	{
		this.canvas = canvas
		this.ctx = canvas.getContext("2d")
		this.width = parseInt(canvas.width)
		this.height = parseInt(canvas.height)
		
		this.blockSize = 20
		this.pullSize = this.blockSize / 4
		this.puzzleMaxWidth = 32
		this.puzzleMaxHeight = 32
		
		this.mode = "paint"
		this.paintColor = 0
		
		this.blockMatrix = []
		this.blockColors = ["#ff0000", "#0000ff", "#00bb00", "#ffaa00", "#cc00ff", "#00bbff", "#ffffff", "#888888", "#884400", "#ff4499"]
		this.pieces = []
		this.pieceMatrix = []
		
		for (let j = 0; j < this.puzzleMaxHeight; j++)
		{
			this.blockMatrix.push([])
			this.pieceMatrix.push([])
			
			for (let i = 0; i < this.puzzleMaxWidth; i++)
			{
				this.blockMatrix[j].push(-1)
				this.pieceMatrix[j].push(-1)
			}
		}
		
		this.marginGround = 50
		
		this.mouseDown = false
		this.mousePos = null
		this.mouseDragOrigin = null
		this.mouseAction = null
		this.mouseSelectedPiece = -1
		this.mouseSelectedPiecePulledLevel = 0
		
		this.canvas.onmousedown = (ev) => this.onMouseDown(ev)
		this.canvas.onmousemove = (ev) => this.onMouseMove(ev)
		this.canvas.onmouseup   = (ev) => this.onMouseUp  (ev)
		
		window.onkeydown = (ev) => this.onKeyDown(ev)
		
		this.draw()
	}
	
	
	resize(width, height)
	{
		this.width = width
		this.height = height
		
		this.canvas.width = width
		this.canvas.height = height
		
		this.draw()
	}
	
	
	setMode(mode)
	{
		this.mode = mode
		this.refreshPieces()
		this.draw()
	}
	
	
	getMousePos(ev)
	{
		const rect = this.canvas.getBoundingClientRect()
		return {
			x: ev.clientX - rect.left,
			y: ev.clientY - rect.top
		}
	}
	
	
	getBlockAt(pos)
	{
		if (pos == null)
			return { x: -1, y: -1 }
		
		const puzzleXMin = this.width / 2 - this.puzzleMaxWidth * this.blockSize / 2
		const puzzleYMin = this.height / 2 - this.puzzleMaxHeight * this.blockSize / 2
		
		return {
			x: Math.floor((pos.x - puzzleXMin) / this.blockSize),
			y: Math.floor((pos.y - puzzleYMin) / this.blockSize)
		}
	}
	
	
	isValidBlock(pos)
	{
		if (pos == null)
			return null
		
		return pos.x >= 0 && pos.x < this.puzzleMaxWidth &&
			pos.y >= 0 && pos.y < this.puzzleMaxHeight
	}
	
	
	getPieceIndexAt(pos)
	{
		const blockAtPos = this.getBlockAt(pos)
		
		if (blockAtPos == null || !this.isValidBlock(blockAtPos))
			return -1
		
		return this.pieceMatrix[blockAtPos.y][blockAtPos.x]
	}
	
	
	onMouseDown(ev)
	{
		ev.preventDefault()
		
		if (this.mouseDown)
			return
		
		const pos = this.getMousePos(ev)
		
		this.mouseAction = null
		this.mouseDragOrigin = pos
		this.mouseDown = true
		
		const blockAtMouse = this.getBlockAt(this.mousePos)
		
		if (this.mode == "paint")
			this.mouseAction = "paint"
		
		else if (this.mode == "debug" && this.isValidBlock(blockAtMouse))
		{
			this.mouseSelectedPiece = this.pieceMatrix[blockAtMouse.y][blockAtMouse.x]
			if (this.mouseSelectedPiece >= 0)
			{
				this.mouseAction = "pull"
				this.mouseSelectedPiecePulledLevel = this.pieces[this.mouseSelectedPiece].pulledLevel
			}
		}
		
		this.draw()
	}
	
	
	onMouseMove(ev)
	{
		ev.preventDefault()
		
		const pos = this.getMousePos(ev)
		this.mousePos = pos
		
		const blockAtMouse = this.getBlockAt(pos)
		
		this.mouseCurrentHoverComponent = null
		this.mouseCurrentHoverData = null
		
		if (this.mouseDown)
		{
			if (this.mouseAction == "paint")
			{
				if (this.isValidBlock(blockAtMouse))
					this.blockMatrix[blockAtMouse.y][blockAtMouse.x] = this.paintColor
			}
			
			else if (this.mouseAction == "pull")
			{
				let piece = this.pieces[this.mouseSelectedPiece]
				piece.pulledLevel = Math.max(0, Math.min(3, Math.round(this.mouseSelectedPiecePulledLevel + (this.mousePos.y - this.mouseDragOrigin.y) / 20)))
			}
		}
		
		this.draw()
	}
	
	
	onMouseUp(ev)
	{
		ev.preventDefault()
		
		if (!this.mouseDown)
			return
		
		this.mouseDown = false
		this.draw()
	}
	
	
	onKeyDown(ev)
	{
		if (ev.key == "Delete" || ev.key == "Backspace")
		{
			ev.preventDefault()
			
		}
	}
	
	
	refreshPieces()
	{
		this.pieces = []
		for (let j = 0; j < this.puzzleMaxHeight; j++)
			for (let i = 0; i < this.puzzleMaxWidth; i++)
				this.pieceMatrix[j][i] = -1
			
		for (let j = 0; j < this.puzzleMaxHeight; j++)
		{
			for (let i = 0; i < this.puzzleMaxWidth; i++)
			{
				if (this.blockMatrix[j][i] < 0 || this.pieceMatrix[j][i] >= 0)
					continue
				
				this.pieces.push(
				{
					colorIndex: this.blockMatrix[j][i],
					blocks: [],
					pulledLevel: 0
				})
				
				this.markPieceBlocksRecursive(this.blockMatrix[j][i], i, j, this.pieces.length - 1)
			}
		}
	}
	
	
	markPieceBlocksRecursive(colorIndex, x, y, pieceIndex)
	{
		if (!this.isValidBlock({ x, y }))
			return
		
		if (this.blockMatrix[y][x] != colorIndex)
			return
		
		if (this.pieceMatrix[y][x] >= 0)
			return
		
		this.pieceMatrix[y][x] = pieceIndex
		this.pieces[pieceIndex].blocks.push({ x, y })
		
		this.markPieceBlocksRecursive(colorIndex, x - 1, y, pieceIndex)
		this.markPieceBlocksRecursive(colorIndex, x + 1, y, pieceIndex)
		this.markPieceBlocksRecursive(colorIndex, x, y - 1, pieceIndex)
		this.markPieceBlocksRecursive(colorIndex, x, y + 1, pieceIndex)
	}
	
	
	draw()
	{
		const puzzleXMin = this.width / 2 - this.puzzleMaxWidth * this.blockSize / 2
		const puzzleXMax = this.width / 2 + this.puzzleMaxWidth * this.blockSize / 2
		const puzzleYMin = this.height / 2 - this.puzzleMaxHeight * this.blockSize / 2
		const puzzleYMax = this.height / 2 + this.puzzleMaxHeight * this.blockSize / 2
		
		this.ctx.save()
		
		this.ctx.fillStyle = "#80cff4"
		this.ctx.fillRect(0, 0, this.width, this.height)
		
		//this.ctx.fillStyle = "#60ff82"
		//this.ctx.fillRect(0, this.height - this.marginGround, this.width, this.marginGround)
		
		this.ctx.lineWidth   = 0.5
		this.ctx.strokeStyle = "#ffffff"
		
		this.ctx.lineDashOffset = this.blockSize / 6
		this.ctx.setLineDash([this.blockSize / 3, this.blockSize / 6])
		
		this.ctx.beginPath()
		for (let j = 0; j <= this.puzzleMaxHeight; j++)
		{
			this.ctx.moveTo(puzzleXMin, puzzleYMin + j * this.blockSize)
			this.ctx.lineTo(puzzleXMax, puzzleYMin + j * this.blockSize)
		}
			
		for (let i = 0; i <= this.puzzleMaxWidth; i++)
		{
			this.ctx.moveTo(puzzleXMin + i * this.blockSize, puzzleYMin)
			this.ctx.lineTo(puzzleXMin + i * this.blockSize, puzzleYMax)
		}
		this.ctx.stroke()
		
		this.ctx.setLineDash([])
		this.ctx.lineWidth = 1
		
		for (let j = this.puzzleMaxHeight - 1; j >= 0; j--)
		{
			for (let i = 0; i < this.puzzleMaxWidth; i++)
			{
				const block = this.blockMatrix[j][i]
				if (block < 0)
					continue
				
				const pulledLevel = (this.mode == "paint" ? 0 : this.pieces[this.pieceMatrix[j][i]].pulledLevel)
				
				const blockX = puzzleXMin + i * this.blockSize
				const blockY = puzzleYMin + j * this.blockSize
				
				this.ctx.fillStyle = this.blockColors[block]
				this.ctx.fillRect(blockX, blockY, this.blockSize, this.blockSize + pulledLevel * this.pullSize)
				
				this.ctx.fillStyle = "#000000"
				this.ctx.globalAlpha = 0.4
				
				for (let p = 0; p < pulledLevel; p++)
					this.ctx.fillRect(blockX, blockY, this.blockSize, (pulledLevel - p) * this.pullSize)
				
				this.ctx.globalAlpha = 0.2
				this.ctx.beginPath()
				this.ctx.moveTo(blockX + this.blockSize * 0.1, blockY + pulledLevel * this.pullSize + this.blockSize * 0.1)
				this.ctx.lineTo(blockX + this.blockSize * 0.9, blockY + pulledLevel * this.pullSize + this.blockSize * 0.1)
				this.ctx.lineTo(blockX + this.blockSize * 0.1, blockY + pulledLevel * this.pullSize + this.blockSize * 0.9)
				this.ctx.lineTo(blockX + this.blockSize * 0.1, blockY + pulledLevel * this.pullSize + this.blockSize * 0.1)
				this.ctx.fill()
				this.ctx.globalAlpha = 1
				
				this.ctx.strokeStyle = "#000000"
				this.ctx.beginPath()
				if (j - 1 < 0 || this.blockMatrix[j - 1][i] != block)
				{
					this.ctx.moveTo(blockX, blockY + pulledLevel * this.pullSize)
					this.ctx.lineTo(blockX + this.blockSize, blockY + pulledLevel * this.pullSize)
				}
				
				if (j + 1 >= this.puzzleMaxHeight || this.blockMatrix[j + 1][i] != block)
				{
					this.ctx.moveTo(blockX, blockY + this.blockSize + pulledLevel * this.pullSize)
					this.ctx.lineTo(blockX + this.blockSize, blockY + this.blockSize + pulledLevel * this.pullSize)
				}
				
				if (i - 1 < 0 || this.blockMatrix[j][i - 1] != block)
				{
					this.ctx.moveTo(blockX, blockY + pulledLevel * this.pullSize)
					this.ctx.lineTo(blockX, blockY + this.blockSize + pulledLevel * this.pullSize)
				}
				
				if (i + 1 >= this.puzzleMaxWidth || this.blockMatrix[j][i + 1] != block)
				{
					this.ctx.moveTo(blockX + this.blockSize, blockY + pulledLevel * this.pullSize)
					this.ctx.lineTo(blockX + this.blockSize, blockY + this.blockSize + pulledLevel * this.pullSize)
				}
				
				this.ctx.stroke()
			}
		}
		
		this.ctx.globalAlpha = 1
		this.ctx.lineWidth = 3
		
		if (!this.mouseDown && this.mode == "paint")
		{
			const blockAtMouse = this.getBlockAt(this.mousePos)
			if (this.isValidBlock(blockAtMouse))
			{
				const blockX = puzzleXMin + blockAtMouse.x * this.blockSize
				const blockY = puzzleYMin + blockAtMouse.y * this.blockSize
				
				if (this.paintColor >= 0)
				{
					this.ctx.globalAlpha = 0.4
					this.ctx.fillStyle = this.blockColors[this.paintColor]
					this.ctx.fillRect(blockX, blockY, this.blockSize, this.blockSize)
					this.ctx.globalAlpha = 1
					
					this.ctx.strokeStyle = this.blockColors[this.paintColor]
				}
				else
					this.ctx.strokeStyle = "#ffff00"
				
				this.ctx.strokeRect(blockX, blockY, this.blockSize, this.blockSize)
			}
		}
		
		if (this.mode == "debug")
		{
			const piece = this.mouseDown ? (this.mouseAction == "pull" ? this.mouseSelectedPiece : -1) : this.getPieceIndexAt(this.mousePos)
			if (piece >= 0)
			{
				this.ctx.globalAlpha = 0.75
				for (const block of this.pieces[piece].blocks)
				{
					const blockX = puzzleXMin + block.x * this.blockSize
					const blockY = puzzleYMin + block.y * this.blockSize
					
					this.ctx.fillStyle = "#ffff00"
					this.ctx.fillRect(blockX, blockY + this.pieces[piece].pulledLevel * this.pullSize, this.blockSize, this.blockSize)
				}
				this.ctx.globalAlpha = 1
			}
		}
		
		this.ctx.restore()
	}
	
	
	saveToString()
	{
		let str = "0,"
		str += this.nodes.size + ","
		
		for (const [key, node] of this.nodes)
		{
			str += (node.pos.x / this.tileSize).toString() + ","
			str += (node.pos.y / this.tileSize).toString() + ","
		}
		
		for (const component of this.components)
		{
			str += component.constructor.getSaveId() + ","
			str += component.saveToString(this)
		}
		
		return str
	}
	
	
	loadFromString(str)
	{
		let strParts = str.split(",")
		
		let reader =
		{
			index: 0,
			isOver() { return this.index >= strParts.length },
			read() { return strParts[this.index++] }
		}
		
		let loadData = 
		{
			nodes: []
		}
		
		const version = parseInt(reader.read())
		const nodeNum = parseInt(reader.read())
		
		for (let i = 0; i < nodeNum; i++)
		{
			const x = parseInt(reader.read()) * this.tileSize
			const y = parseInt(reader.read()) * this.tileSize
			loadData.nodes.push({ x, y })
		}
		
		const componentClasses =
		[
			ComponentWire,
			ComponentBattery,
			ComponentResistor,
			ComponentCurrentSource,
			ComponentCapacitor,
			ComponentInductor,
			ComponentVoltageSource
		]
		
		let componentIds = new Map()
		for (const c of componentClasses)
			componentIds.set(c.getSaveId(), c)
		
		while (!reader.isOver())
		{
			const id = reader.read()
			if (id == null || id == "")
				break
			
			const componentClass = componentIds.get(id)
			const component = new componentClass({ x: 0, y: 0 })
			component.loadFromString(this, loadData, reader)
			
			this.components.push(component)
		}
		
		this.removeDegenerateComponents()
		this.refreshNodes()
		this.draw()
	}
}