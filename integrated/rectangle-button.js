/**
 * fungsi ini berguna untuk memasukkan rectangle ke dalam canvas
 * dan menambahkan aksi yang dilakukan untuk masing masing event
 * onclick, onmove, ondrop
 */
rectangleBtn.addEventListener("click", () => {
  const rectangle = new Rectangle()
  rectangle.init(gl)

  let pointChosen = -1
  let rectangleChosen = false
  let offset = []
  const objectIdx = object.length
  let rectangleMidpoint = {}
  let rotation = 0

  const rectangleClickMoveAction = (self, mousePoint) => {
      pointChosen = -1

      const rectanglePoints = self.getPoints()
      for(let i = 0; i < rectanglePoints.length; ++i) {
          const temp = rectanglePoints[i]

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

      rectangleChosen = true

      offset.length = 0

      for(let i = 0; i < rectanglePoints.length; ++i) {
          const temp = rectanglePoints[i]

          offset.push({
              x: temp.x - mousePoint.x,
              y: temp.y - mousePoint.y
          })
      }
  }

  const rectangleClickColorAction = (self, mousePoint) => {
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

  const rectangleClickRotateAction = (self, mousePoint) => {
      const linePoints = self.getPoints()
      rectangleMidpoint = calculateMidpoint(linePoints)
      rectangleChosen = true
      mousePrevious = mousePoint
  }

  const rectangleClickScaleAction = (self, mousePoint) => {
      rectangleChosen = true
      mousePrevious = mousePoint
      rectangleMidpoint = calculateMidpoint(self.getPoints())
  }

  rectangle.addOnClickEvent((self, mousePoint) => {
      if(toolState === ToolState.Move) {
          rectangleClickMoveAction(self, mousePoint)
      } else if(toolState === ToolState.Color) {
          rectangleClickColorAction(self, mousePoint)
      } else if(toolState === ToolState.Rotate) {
          rectangleClickRotateAction(self, mousePoint)
      } else if(toolState === ToolState.Scale) {
          rectangleClickScaleAction(self, mousePoint)
      }
  })

  /**
   * Fungsi ini berfungsi untuk memindahkan titik dari kotak ataupun tubuh dari kotak
   * apabila titik dari kotak diubah posisinya, maka fungsi ini berusaha memastikan aspect ratio dari kotak tersebut terjaga
   */
  const rectangleMoveMoveAction = (self, mousePoint) => {
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

          const x = mousePos.x
          const y = mousePos.y

          const diffX = x - points[pointChosen].x
          const diffY = y - points[pointChosen].y

          let [x1, y1] = [points[0].x, points[0].y]
          let [x2, y2] = [points[2].x, points[2].y]
          if (pointChosen === 0) {
            x1 += diffX
            y1 += diffY
          } else if (pointChosen === 1) {
            x1 += diffX
            y2 += diffY
          } else if (pointChosen === 2) {
            x2 += diffX
            y2 += diffY
          } else if (pointChosen === 3) {
            x2 += diffX
            y1 += diffY
          }

          const newPoint = [
            { x: x1, y: y1 },
            { x: x1, y: y2 },
            { x: x2, y: y2 },
            { x: x2, y: y1 },
          ]

          for(let i = 0; i < newPoint.length; ++i) {
              if(rotation !== 0) {
                  newPoint[i] = rotatePoint(newPoint[i], rotation, midpoint)
              }
              // console.log(newPoint[i])
              self.setPoint(i, newPoint[i])
          }

          // for(let i = 0; i < points.length; ++i) {
          //     self.setPoint(i, points)
          // }
          // const rectanglePoints = self.getPoints()
          // for(let i = 0; i < rectanglePoints.length; ++i) {
          //     if(pointChosen === i) {
          //         continue
          //     }
          //     const temp = rectanglePoints[i]
          //     if(temp.x === rectanglePoints[pointChosen].x) {
          //         temp.x = mousePoint.x
          //         self.setPoint(i, temp)
          //     }

          //     if(temp.y === rectanglePoints[pointChosen].y) {
          //         temp.y = mousePoint.y
          //         self.setPoint(i, temp)
          //     }
          // }
          // self.setPoint(pointChosen, mousePoint)
      }

      if(rectangleChosen) {
          const pointCount = self.getPointCount()
          for(let i = 0; i < pointCount; ++i) {
              self.setPoint(i, {
                  x: offset[i].x + mousePoint.x,
                  y: offset[i].y + mousePoint.y
              })
          }
      }
  }

  const rectangleMoveRotateAction = (self, mousePoint) => {
      if(rectangleChosen) {
          const gradient1 = calculateGradient(mousePrevious, rectangleMidpoint)
          const gradient2 = calculateGradient(mousePoint, rectangleMidpoint)

          const dividend = gradient1 - gradient2
          const divisor = 1 + (gradient1 * gradient2)

          const angle = Math.atan(dividend / divisor) * -1
          rotation = (rotation + angle) % (Math.PI * 2)

          const linePoints = self.getPoints()
          const pointCount = self.getPointCount()

          for(let i = 0; i < pointCount; ++i) {
              const temp = linePoints[i]

              const rotatedPoint = rotatePoint(temp, angle, rectangleMidpoint)

              self.setPoint(i, rotatedPoint)
          }

          mousePrevious = mousePoint
      }
  }

  const rectangleMoveScaleAction = (self, mousePoint) => {
      if(rectangleChosen) {
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

  rectangle.addOnMoveEvent((self, mousePoint) => {
      if(toolState === ToolState.Move) {
          rectangleMoveMoveAction(self, mousePoint)
      } else if(toolState === ToolState.Rotate) {
          rectangleMoveRotateAction(self, mousePoint)
      } else if(toolState === ToolState.Scale) {
          rectangleMoveScaleAction(self, mousePoint)
      }
  })
  
  rectangle.addOnDropEvent((self, mousePoint) => {
      pointChosen = -1
      rectangleChosen = false

  })

  object.push(rectangle)
})