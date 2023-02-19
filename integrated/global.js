/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas")
const gl = canvas.getContext("webgl")
const selectedCircle = new Selected()
selectedCircle.init(gl)
let drawSelectedCircle = false
let selected = {
    objectIndex: 0,
    pointIndex: 0
}

const object = []
let previousLength = 0

let drawPreview = false
const previewTriangle = new Preview()
previewTriangle.init(gl)

const resetSelected = () => {
    selected.objectIndex = -1
    selected.pointIndex = 0
    drawSelectedCircle = false
    drawPreview = false
}

Array.prototype.insert = function ( index, ...items ) {
    this.splice( index, 0, ...items );
};

const canvas_data = new CanvasData();