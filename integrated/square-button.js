/**
 * fungsi ini berguna untuk memasukkan square ke dalam canvas
 * dan menambahkan aksi yang dilakukan untuk masing masing event
 * onclick, onmove, ondrop
 */
squareBtn.addEventListener("click", () => {
    const square = new Square()
    square.init(gl)
    canvas_data.add(square)

    let pointChosen = -1
    let squareChosen = false
    let offset = []
    const objectIdx = object.length
    let squareMidpoint = {}
    let rotation = 0

    const squareClickMoveAction = (self, mousePoint) => {
        pointChosen = -1

        const squarePoints = self.getPoints()
        for(let i = 0; i < squarePoints.length; ++i) {
            const temp = squarePoints[i]

            const diffX = Math.abs(temp.x - mousePoint.x)
            const diffY = Math.abs(temp.y - mousePoint.y)

            if(diffX <= 0.05 && diffY <= 0.05) {
                pointChosen = i
                break
            }
        }

        // console.log(pointChosen)
        if(pointChosen !== -1) {
            return
        }

        squareChosen = true

        offset.length = 0

        for(let i = 0; i < squarePoints.length; ++i) {
            const temp = squarePoints[i]

            offset.push({
                x: temp.x - mousePoint.x,
                y: temp.y - mousePoint.y
            })
        }
    }

    const squareClickColorAction = (self, mousePoint) => {
        const linePoints = self.getPoints()

        for(let i = 0; i < linePoints.length; ++i) {
            const temp = linePoints[i]
            const diffY = Math.abs(temp.y - mousePoint.y)
            const diffX = Math.abs(temp.x - mousePoint.x)

            if(diffY <= 0.05 && diffX <= 0.05) {
                selected.objectIndex = objectIdx
                selected.pointIndex = i
                selectedCircle.setPosition({
                    x: temp.x,
                    y: temp.y
                })
                drawSelectedCircle = true

                setSlider()
            }
        }
    }

    const squareClickRotateAction = (self, mousePoint) => {
        const linePoints = self.getPoints()
        squareMidpoint = calculateMidpoint(linePoints)
        squareChosen = true
        mousePrevious = mousePoint
    }

    const squareClickScaleAction = (self, mousePoint) => {
        squareChosen = true
        mousePrevious = mousePoint
        squareMidpoint = calculateMidpoint(self.getPoints())
    }

    square.addOnClickEvent((self, mousePoint) => {
        if(toolState === ToolState.Move) {
            squareClickMoveAction(self, mousePoint)
        } else if(toolState === ToolState.Color) {
            squareClickColorAction(self, mousePoint)
        } else if(toolState === ToolState.Rotate) {
            squareClickRotateAction(self, mousePoint)
        } else if(toolState === ToolState.Scale) {
            squareClickScaleAction(self, mousePoint)
        }
    })

    /**
     * Fungsi ini berfungsi untuk memindahkan titik dari kotak ataupun tubuh dari kotak
     * apabila titik dari kotak diubah posisinya, maka fungsi ini berusaha memastikan aspect ratio dari kotak tersebut terjaga
     */
    const squareMoveMoveAction = (self, mousePoint) => {
        if(pointChosen !== -1) {
            const points = self.getPoints()
            let mousePos = mousePoint
            const midpoint = calculateMidpoint(points)
            if(rotation !== 0) {
                for(let i = 0; i < points.length; ++i) {
                    points[i] = rotatePoint(points[i], -rotation, midpoint)
                }
                // points = rotatePoint(points, -rotation, midpoint)
                mousePos = rotatePoint(mousePoint, -rotation, midpoint)
            }

            const x1 = mousePos.x
            const y1 = mousePos.y
            let sideLength = 0
            if(pointChosen === 0) {
                const diffX = x1 - points[1].x
                const diffY = y1 - points[1].y

                sideLength = Math.sqrt(diffX * diffX + diffY * diffY)
            } else if(pointChosen === 1) {
                const diffX = x1 - points[0].x
                const diffY = y1 - points[0].y

                sideLength = Math.sqrt(diffX * diffX + diffY * diffY)
            } else if(pointChosen === 2) {
                const diffX = x1 - points[3].x
                const diffY = y1 - points[3].y

                sideLength = Math.sqrt(diffX * diffX + diffY * diffY)
            } else if(pointChosen === 3) {
                const diffX = x1 - points[2].x
                const diffY = y1 - points[2].y

                sideLength = Math.sqrt(diffX * diffX + diffY * diffY)
            }

            const newPoint = []

            if(pointChosen === 0) {
                newPoint.push({
                    x: mousePos.x,
                    y: mousePos.y
                })
                newPoint.push({
                    x: mousePos.x,
                    y: mousePos.y + sideLength
                })
                newPoint.push({
                    x: mousePos.x + sideLength,
                    y: mousePos.y + sideLength
                })
                newPoint.push({
                    x: mousePos.x + sideLength,
                    y: mousePos.y
                })
            } else if(pointChosen === 1) {
                newPoint.push({
                    x: mousePos.x,
                    y: mousePos.y - sideLength
                })
                newPoint.push({
                    x: mousePos.x,
                    y: mousePos.y
                })
                newPoint.push({
                    x: mousePos.x + sideLength,
                    y: mousePos.y
                })
                newPoint.push({
                    x: mousePos.x + sideLength,
                    y: mousePos.y - sideLength
                })
            } else if(pointChosen === 2) {
                newPoint.push({
                    x: mousePos.x - sideLength,
                    y: mousePos.y - sideLength
                })
                newPoint.push({
                    x: mousePos.x - sideLength,
                    y: mousePos.y
                })
                newPoint.push({
                    x: mousePos.x,
                    y: mousePos.y
                })
                newPoint.push({
                    x: mousePos.x,
                    y: mousePos.y - sideLength
                })
            } else if(pointChosen === 3) {
                newPoint.push({
                    x: mousePos.x - sideLength,
                    y: mousePos.y
                })
                newPoint.push({
                    x: mousePos.x - sideLength,
                    y: mousePos.y + sideLength
                })
                newPoint.push({
                    x: mousePos.x,
                    y: mousePos.y + sideLength
                })
                newPoint.push({
                    x: mousePos.x,
                    y: mousePos.y
                })
            }

            for(let i = 0; i < newPoint.length; ++i) {
                if(rotation !== 0) {
                    newPoint[i] = rotatePoint(newPoint[i], rotation, midpoint)
                }
                console.log(newPoint[i])
                self.setPoint(i, newPoint[i])
            }

            // for(let i = 0; i < points.length; ++i) {
            //     self.setPoint(i, points)
            // }
            // const squarePoints = self.getPoints()
            // for(let i = 0; i < squarePoints.length; ++i) {
            //     if(pointChosen === i) {
            //         continue
            //     }
            //     const temp = squarePoints[i]
            //     if(temp.x === squarePoints[pointChosen].x) {
            //         temp.x = mousePoint.x
            //         self.setPoint(i, temp)
            //     }

            //     if(temp.y === squarePoints[pointChosen].y) {
            //         temp.y = mousePoint.y
            //         self.setPoint(i, temp)
            //     }
            // }
            // self.setPoint(pointChosen, mousePoint)
        }

        if(squareChosen) {
            const pointCount = self.getPointCount()
            for(let i = 0; i < pointCount; ++i) {
                self.setPoint(i, {
                    x: offset[i].x + mousePoint.x,
                    y: offset[i].y + mousePoint.y
                })
            }
        }
    }

    const squareMoveRotateAction = (self, mousePoint) => {
        if(squareChosen) {
            const gradient1 = calculateGradient(mousePrevious, squareMidpoint)
            const gradient2 = calculateGradient(mousePoint, squareMidpoint)

            const dividend = gradient1 - gradient2
            const divisor = 1 + (gradient1 * gradient2)

            const angle = Math.atan(dividend / divisor) * -1
            rotation = (rotation + angle) % (Math.PI * 2)

            const linePoints = self.getPoints()
            const pointCount = self.getPointCount()

            for(let i = 0; i < pointCount; ++i) {
                const temp = linePoints[i]

                const rotatedPoint = rotatePoint(temp, angle, squareMidpoint)

                self.setPoint(i, rotatedPoint)
            }

            mousePrevious = mousePoint
        }
    }

    const squareMoveScaleAction = (self, mousePoint) => {
        if(squareChosen) {
            const diffX = mousePoint.x / mousePrevious.x

            const scale = diffX
    
            const linePoints = self.getPoints()
    
            for(let i = 0; i < linePoints.length; ++i) {
                const newPoint = {
                    x: linePoints[i].x * scale,
                    y: linePoints[i].y * scale
                }
    
                self.setPoint(i, newPoint)
            }
    
            mousePrevious = mousePoint
        }
    }

    square.addOnMoveEvent((self, mousePoint) => {
        if(toolState === ToolState.Move) {
            squareMoveMoveAction(self, mousePoint)
        } else if(toolState === ToolState.Rotate) {
            squareMoveRotateAction(self, mousePoint)
        } else if(toolState === ToolState.Scale) {
            squareMoveScaleAction(self, mousePoint)
        }
    })
    
    square.addOnDropEvent((self, mousePoint) => {
        pointChosen = -1
        squareChosen = false

    })

    object.push(square)
})