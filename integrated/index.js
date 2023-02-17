/**
 * @type {HTMLInputElement}
 */
const lineBtn = document.getElementById("line-btn")

/**
 * @type {HTMLInputElement}
 */
const squareBtn = document.getElementById("square-btn")

/**
 * @type {HTMLInputElement}
 */
const rectangleBtn = document.getElementById("rectangle-btn")

/**
 * @type {HTMLInputElement}
 */
const polygonBtn = document.getElementById("polygon-btn")


/**
 * drawing all of the objects every frame
 */
function app() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    if(drawPreview) {
        previewTriangle.draw(gl)
    }
    for(let i = 0; i < object.length; ++i) {
        object[i].draw(gl)
    }
    if(drawSelectedCircle) {
        selectedCircle.draw(gl)
    }
    previousLength = object.length
    setTimeout(app)
}

setTimeout(app)

/**
 * function ini berguna untuk mengubah titik menjadi bentuk
 * -1 s/d 1
 * @param {DOMRect} rect 
 * @param {JSON} point 
 */
function convertPoint(rect, point) {
    if(!point.hasOwnProperty("x")) {
        throw new Error("Point passed lacks the key for x")
    }
    if(!point.hasOwnProperty("y")) {
        throw new Error("Point passed lacks the key for y")
    }
    const result = {
        x: 0,
        y: 0
    }

    result.x = point.x - (rect.width / 2)
    result.y = point.y - (rect.height / 2)

    result.x = result.x / ( rect.width / 2)
    result.y = result.y / (rect.height / 2)
    result.y = -result.y

    return result
}

let isClicked = false
/**
 * apabila canvas diklik, maka akan memanggil semua object
 * yang memiliki onclick event
 */
canvas.addEventListener("mousedown", (event) => {
    isClicked = false
    if(toolState === ToolState.Color) {
        resetSelected()
    }
    var rect = canvas.getBoundingClientRect()
    const pos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }

    const convertedPoint = convertPoint(rect, pos)
    for(let i = 0; i < object.length; ++i) {
        if(object[i].checkPointInside(convertedPoint)) {
            object[i].onClick(convertedPoint)
            isClicked = true
            break
        }
    }
    if(!isClicked) {
        if(toolState === ToolState.Select) {
            if(selected.objectIndex !== -1) {
                const chosenObject = object[selected.objectIndex]
                chosenObject.addPoint(convertedPoint)
            }
        }
    }
})

/**
 * apabila mouse bergerak di dalam canvas, maka
 * memanggil semua object yang memiliki on move event
 */
canvas.addEventListener("mousemove", (event) => {
    var rect = canvas.getBoundingClientRect()
    const pos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }

    const convertedPoint = convertPoint(rect, pos)

    if(toolState === ToolState.Select) {
        if(selected.objectIndex !== -1) {
            const chosenObject = object[selected.objectIndex]
            if(chosenObject.checkPointInside(convertedPoint)) {
                drawPreview = false
                return
            }
            drawPreview = true
            const pointIdx = chosenObject.getClosestPoint(convertedPoint)
            previewTriangle.setPoint(0, chosenObject.getPoint(0))
            previewTriangle.setPoint(1, chosenObject.getPoint(chosenObject.getPointCount() - 1))
            previewTriangle.setPoint(2, convertedPoint)

            return
        }
    }
    for(let i = 0; i < object.length; ++i) {
        object[i].onMove(convertedPoint)
    }
    isClicked = false
})

/**
 * apabila mouse berhenti click di dalam canvas, maka
 * memanggil semua object yang memiliki on drop event
 */
canvas.addEventListener("mouseup", (event) => {
    var rect = canvas.getBoundingClientRect()
    const pos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }

    const convertedPoint = convertPoint(rect, pos)
    for(let i = 0; i < object.length; ++i) {
        object[i].onDrop(convertedPoint)
    }
})

/**
 * apabila mouse keluar dari canvas, maka
 * memanggil semua object yang memiliki on drop event
 */
canvas.addEventListener("mouseout", (event) => {
    var rect = canvas.getBoundingClientRect()
    const pos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }

    const convertedPoint = convertPoint(rect, pos)
    for(let i = 0; i < object.length; ++i) {
        object[i].onDrop(convertedPoint)
    }
})
