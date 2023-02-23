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

let changes = -0.001

setInterval(() => {
    if(drawSelectedCircle) {
        if(selectedCircle.getRadius() >= 0.03) {
            changes = -0.001
        } else if(selectedCircle.getRadius() <= 0.01) {
            changes = 0.001
        }
        selectedCircle.setRadius(selectedCircle.getRadius() + changes)
        selectedCircle.setPosition(selectedCircle.getPosition())
        console.log(selectedCircle.getRadius())
    }
}, 10)

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