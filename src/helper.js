function calculateGradient(first, second) {
    const result = (first.y - second.y) / (first.x - second.x)
    return result
}

function calculateConstant(gradient, point) {
    return point.y - (gradient * point.x)
}

/**
 * 
 * @param {Array} points 
 */
const calculateMidpoint = (points) => {
    const midpoint = {
        x: 0,
        y: 0
    }

    for(let i = 0; i < points.length; ++i) {
        midpoint.x += points[i].x
        midpoint.y += points[i].y
    }

    midpoint.x /= points.length
    midpoint.y /= points.length

    return midpoint
}

function calculateDistance(point1, point2) {
    const diffX = point1.x - point2.x
    const diffY = point1.y - point2.y
    return Math.sqrt(diffX * diffX + diffY * diffY)
}

function rotatePoint(point, angle, anchor) {
    const temp = point
    const s = Math.sin(angle)
    const c = Math.cos(angle)

    const newPoint = {
        x: temp.x - anchor.x,
        y: temp.y - anchor.y
    }
    
    const rotatedPoint = {
        x: newPoint.x * c - newPoint.y * s,
        y: newPoint.x * s + newPoint.y * c
    }

    rotatedPoint.x += anchor.x
    rotatedPoint.y += anchor.y

    return rotatedPoint
}