const toolStateDisplay = document.getElementById("tool-state")
const rotateBtn = document.getElementById("rotate-btn")
const moveBtn = document.getElementById("move-btn")
const scaleBtn = document.getElementById("scale-btn")
const selectBtn = document.getElementById("select-btn")
const colorBtn = document.getElementById("color-btn")
const exportBtn = document.getElementById("export-btn")

const colorTool = document.getElementById("color-tool")
colorTool.style.display = "none"
const exportFilename = document.getElementById("export-filename")

/**
 * enum for all possible tool state
 * @readonly
 * @enum
 */
const ToolState = Object.freeze({
    Rotate: Symbol("rotate"),
    Move: Symbol("move"),
    Scale: Symbol("scale"),
    Select: Symbol("select"),
    Color: Symbol("color")
})

let toolState = ToolState.Move

rotateBtn.addEventListener("click", () => {
    toolState = ToolState.Rotate
    toolStateDisplay.innerText = "Rotate"
    colorTool.style.display = "none"

    resetSelected()
})

moveBtn.addEventListener("click", () => {
    toolState = ToolState.Move
    toolStateDisplay.innerText = "Move"
    colorTool.style.display = "none"

    resetSelected()
})

scaleBtn.addEventListener("click", () => {
    toolState = ToolState.Scale
    toolStateDisplay.innerText = "Scale"
    colorTool.style.display = "none"

    resetSelected()
})

selectBtn.addEventListener("click", () => {
    toolState = ToolState.Select
    toolStateDisplay.innerText = "Select"
    colorTool.style.display = "none"

    resetSelected()
})

colorBtn.addEventListener("click", () => {
    toolState = ToolState.Color
    toolStateDisplay.innerText = "Color"
    colorTool.style.display = "block"
})

exportBtn.addEventListener("click", () => {
    canvas_data.save(exportFilename.value)
})