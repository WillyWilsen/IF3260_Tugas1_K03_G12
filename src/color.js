/**
 * @type {HTMLInputElement}
 */
const red =  document.getElementById("red")
/**
 * @type {HTMLInputElement}
 */
const green = document.getElementById("green")
/**
 * @type {HTMLInputElement}
 */
const blue = document.getElementById("blue")

/**
 * mengset warna pada slider sesuai dengan pilihan vertex pada object yang telah dipilih
 */
const setSlider = () => {
    const chosenObject = object[selected.objectIndex]
    const chosenIndex = selected.pointIndex

    const pointColor = chosenObject.getColor(chosenIndex)
    const convertedColor = convertColorValue(pointColor)

    red.value = convertedColor.r
    green.value = convertedColor.g
    blue.value = convertedColor.b
}

red.addEventListener("input", () => {
    const newColor = {
        r: red.value,
        g: green.value,
        b: blue.value
    }

    const normalizedColor = normalizeColorValue(newColor)

    object[selected.objectIndex].setColor(selected.pointIndex, normalizedColor)
})

green.addEventListener("input", () => {
    const newColor = {
        r: red.value,
        g: green.value,
        b: blue.value
    }

    const normalizedColor = normalizeColorValue(newColor)

    object[selected.objectIndex].setColor(selected.pointIndex, normalizedColor)
})

blue.addEventListener("input", () => {
    const newColor = {
        r: red.value,
        g: green.value,
        b: blue.value
    }

    const normalizedColor = normalizeColorValue(newColor)

    object[selected.objectIndex].setColor(selected.pointIndex, normalizedColor)
})

/**
 * this function converts color from value of 0-1 to 0-255
 * @param {JSON} color 
 */
function convertColorValue(color) {
    const newColor = {
        r: color.r * 255,
        g: color.g * 255,
        b: color.b * 255
    }

    return newColor
}

/**
 * this function converts color from value of 0-255 to 0-1
 * @param {JSON} color 
 */
function normalizeColorValue(color) {
    const newColor = {
        r: color.r / 255,
        g: color.g / 255,
        b: color.b / 255
    }

    return newColor
}