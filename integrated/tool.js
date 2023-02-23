const toolStateDisplay = document.getElementById("tool-state")
const rotateBtn = document.getElementById("rotate-btn")
const moveBtn = document.getElementById("move-btn")
const scaleBtn = document.getElementById("scale-btn")
const selectBtn = document.getElementById("select-btn")
const colorBtn = document.getElementById("color-btn")
const deleteBtn = document.getElementById("delete-btn")
const exportBtn = document.getElementById("export-btn")
const importBtn = document.getElementById("import-btn")

const colorTool = document.getElementById("color-tool")
colorTool.style.display = "none"
const exportFilename = document.getElementById("export-filename")
const importFile = document.getElementById("import-file")

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
    Color: Symbol("color"),
    Delete: Symbol("delete")
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

deleteBtn.addEventListener("click", () => {
    toolState = ToolState.Delete
    toolStateDisplay.innerText = "Delete"
    colorTool.style.display = "none"
})

exportBtn.addEventListener("click", () => {
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([JSON.stringify(object)], {type: 'text/plain'}));
    a.download = `${exportFilename.value}.txt`;
    a.click();
})

importBtn.addEventListener("click", () => {
    if (importFile) {
        const fr = new FileReader();
        fr.readAsText(importFile.files[0]);
        fr.onload = function() {
            const result = JSON.parse(fr.result)
            for (let i = 0; i < result.length; i++) {
                const obj = new (eval(result[i].type))();
                obj.init(gl)
                obj.set(result[i].length, result[i].color, result[i].vertexes)
                object.push(obj)
                if(obj instanceof Polygon) {
                    (() => {
                        let pointChosen = -1
                        let polygonChosen = false
                        let offset = []
                        const objectIdx = object.length
                        let polygonMidpoint = {}
                        let rotation = 0

                        /**
                         * fungsi ini berfungsi untuk memeriksa apakah vertex dari polygon yang diklik ataukah tubuh dari polygon yang diklik
                         * @param {Polygon} self 
                         * @param {JSON} mousePoint 
                         * @returns 
                         */
                        const polygonClickMoveAction = (self, mousePoint) => {
                            pointChosen = -1

                            const polygonPoints = self.getPoints()
                            for(let i = 0; i < polygonPoints.length; ++i) {
                                const temp = polygonPoints[i]

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

                            polygonChosen = true

                            offset.length = 0

                            for(let i = 0; i < polygonPoints.length; ++i) {
                                const temp = polygonPoints[i]

                                offset.push({
                                    x: temp.x - mousePoint.x,
                                    y: temp.y - mousePoint.y
                                })
                            }
                        }

                        /**
                         * fungsi ini memeriksa vertex manakah dari polygon yang diklik dan mempersiapkannya
                         * untuk pengubahan warna
                         * @param {Polygon} self 
                         * @param {JSON} mousePoint 
                         */
                        const polygonClickColorAction = (self, mousePoint) => {
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

                        /**
                         * fungsi ini berfungsi untuk mempesiapkan polygon untuk dirotasi
                         * @param {Polygon} self 
                         * @param {JSON} mousePoint 
                         */
                        const polygonClickRotateAction = (self, mousePoint) => {
                            const linePoints = self.getPoints()
                            polygonMidpoint = calculateMidpoint(linePoints)
                            polygonChosen = true
                            mousePrevious = mousePoint
                        }

                        /**
                         * Fungsi ini berfungsi untuk mempersiapkan polygon untuk discale
                         * @param {Polygon} self 
                         * @param {JSON} mousePoint 
                         */
                        const polygonClickScaleAction = (self, mousePoint) => {
                            polygonChosen = true
                            mousePrevious = mousePoint
                            polygonMidpoint = calculateMidpoint(self.getPoints())
                        }

                        /**
                         * Fungsi ini berfungsi untuk mempersiapkan polygon supaya salah satu vertexnya
                         * dapat ditambahkan
                         * @param {Polygon} self 
                         * @param {JSON} mousePoint 
                         */
                        const polygonClickSelectAction = (self, mousePoint) => {
                            polygonChosen = true
                            polygonMidpoint = calculateMidpoint(self.getPoints())
                            selected.objectIndex = objectIdx
                            selectedCircle.setPosition(polygonMidpoint)
                            drawSelectedCircle = true
                        }

                        /**
                         * fungsi ini memeriksa vertex manakah dari polygon yang diklik dan menghapusnya
                         * @param {Polygon} self 
                         * @param {JSON} mousePoint 
                         */
                        const polygonClickDeleteAction = (self, mousePoint) => {
                            const linePoints = self.getPoints()

                            for(let i = 0; i < linePoints.length; ++i) {
                                const temp = linePoints[i]
                                const diffY = Math.abs(temp.y - mousePoint.y)
                                const diffX = Math.abs(temp.x - mousePoint.x)

                                if(diffY <= 0.05 && diffX <= 0.05) {
                                    selected.objectIndex = objectIdx
                                    selected.pointIndex = i
                                    const chosenObject = object[selected.objectIndex]
                                    chosenObject.deletePoint(selected.pointIndex)
                                }
                            }
                        }

                        /**
                         * Menambahkan callback kepada polygon
                         * di callback inilah dihandle function mana yang dipanggil tergantung tool
                         */
                        obj.addOnClickEvent((self, mousePoint) => {
                            if(toolState === ToolState.Move) {
                                polygonClickMoveAction(self, mousePoint)
                            } else if(toolState === ToolState.Color) {
                                polygonClickColorAction(self, mousePoint)
                            } else if(toolState === ToolState.Rotate) {
                                polygonClickRotateAction(self, mousePoint)
                            } else if(toolState === ToolState.Scale) {
                                polygonClickScaleAction(self, mousePoint)
                            } else if(toolState === ToolState.Select) {
                                polygonClickSelectAction(self, mousePoint)
                            } else if(toolState === ToolState.Delete) {
                                polygonClickDeleteAction(self, mousePoint)
                            }
                        })

                        /**
                         * Melakukan pergerakan pada polygon, baik itu merupakan titik maupun seluruh polygon sesuai dengan pergerakan mouse
                         */
                        const polygonMoveMoveAction = (self, mousePoint) => {
                            if(pointChosen !== -1) {
                                self.setPoint(pointChosen, mousePoint)
                            }

                            if(polygonChosen) {
                                const pointCount = self.getPointCount()
                                for(let i = 0; i < pointCount; ++i) {
                                    self.setPoint(i, {
                                        x: offset[i].x + mousePoint.x,
                                        y: offset[i].y + mousePoint.y
                                    })
                                }
                            }
                        }

                        /**
                         * melakukan kalkukasi rotasi pada polygon sesuai dengan pergerakan mouse
                         */
                        const polygonMoveRotateAction = (self, mousePoint) => {
                            if(polygonChosen) {
                                const gradient1 = calculateGradient(mousePrevious, polygonMidpoint)
                                const gradient2 = calculateGradient(mousePoint, polygonMidpoint)

                                const dividend = gradient1 - gradient2
                                const divisor = 1 + (gradient1 * gradient2)

                                const angle = Math.atan(dividend / divisor) * -1
                                rotation = (rotation + angle) % (Math.PI * 2)

                                const linePoints = self.getPoints()
                                const pointCount = self.getPointCount()

                                for(let i = 0; i < pointCount; ++i) {
                                    const temp = linePoints[i]

                                    const rotatedPoint = rotatePoint(temp, angle, polygonMidpoint)

                                    self.setPoint(i, rotatedPoint)
                                }

                                mousePrevious = mousePoint
                            }
                        }

                        /**
                         * Fungsi inilah yang mengkalkulasi scaling dari polygon
                         * @param {Polygon} self 
                         * @param {JSON} mousePoint 
                         */
                        const polygonMoveScaleAction = (self, mousePoint) => {
                            if(polygonChosen) {
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

                        /**
                         * Menambahkan callback kepada onmove event dari polygon
                         * inilah yang menghandle memanggil fungsi mana tergantung dengan tool
                         */
                        obj.addOnMoveEvent((self, mousePoint) => {
                            if(toolState === ToolState.Move) {
                                polygonMoveMoveAction(self, mousePoint)
                            } else if(toolState === ToolState.Rotate) {
                                polygonMoveRotateAction(self, mousePoint)
                            } else if(toolState === ToolState.Scale) {
                                polygonMoveScaleAction(self, mousePoint)
                            }
                        })
                        
                        obj.addOnDropEvent((self, mousePoint) => {
                            pointChosen = -1
                            polygonChosen = false

                        })
                    })()
                } else if(obj instanceof Line) {
                    (() => {
                        console.log("test")
                        let pointChosenLine = -1
                        let lineChosen = false
                        let offset = []
                        const objectIdx = object.length
                        /**
                         * fungsi ini menandai bagian dari Line yang diklik,
                         * apakah bagian tersebut merupakan bagian vertex maupun
                         * bagian yang bukan vertex
                         * @param {Line} self 
                         * @param {JSOn} mousePoint 
                         * @returns 
                         */
                        const lineClickMoveAction = (self, mousePoint) => {
                            const linePoints = self.getPoints()
                            pointChosenLine = -1
                            linechosen = false
                            for(let i = 0; i < linePoints.length; ++i) {
                                const temp = linePoints[i]
                                const diffX = Math.abs(temp.x - mousePoint.x)
                                const diffY = Math.abs(temp.y - mousePoint.y)
                                if(diffX < 0.05 && diffY < 0.05) {
                                    pointChosenLine = i
                                }
                            }
    
                            if(pointChosenLine !== -1) {
                                return
                            }
    
                            offset.length = 0
                            for(let i = 0; i < linePoints.length; ++i) {
                                const temp = linePoints[i]
                                const diffY = temp.y - mousePoint.y
                                const diffX = temp.x - mousePoint.x
                                offset.push({
                                    x: diffX,
                                    y: diffY
                                })
                            }
    
                            lineChosen = true
                        }
    
                        /**
                         * fungsi ini berfungsi untuk menerima bagian vertex mana yang diklik
                         * ketika tool berada pada color
                         * @param {Line} self 
                         * @param {JSON} mousePoint 
                         */
                        const lineClickColorAction = (self, mousePoint) => {
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
                        
                        let mousePrevious = {}
                        let lineMidpoint = {}
    
                        /**
                         * fungsi ini mempersiapkan kalkukasi rotasi garis
                         * @param {Line} self 
                         * @param {JSON} mousePoint 
                         */
                        const lineClickRotateAction = (self, mousePoint) => {
                            const linePoints = self.getPoints()
                            lineMidpoint = calculateMidpoint(linePoints)
                            lineChosen = true
                            mousePrevious = mousePoint
                        }
    
                        /**
                         * fungsi ini mempersiapkan kalkulasi skala garis
                         * @param {Line} self 
                         * @param {JSON} mousePoint 
                         */
                        const lineClickScaleAction = (self, mousePoint) => {
                            lineChosen = true
                            mousePrevious = mousePoint
                        }
    
                        /**
                         * menambahkan onclick event callback kepada garis.
                         * callback inilah yang menghandle fungsi manakah yang dipanggil tergantung dengan keadaan tool
                         */
                        obj.addOnClickEvent((self, mousePoint) => {
                            if(toolState === ToolState.Move) {
                                lineClickMoveAction(self, mousePoint)
                            } else if(toolState === ToolState.Color) {
                                lineClickColorAction(self, mousePoint)
                            } else if(toolState === ToolState.Rotate) {
                                lineClickRotateAction(self, mousePoint)
                            } else if(toolState === ToolState.Scale) {
                                lineClickScaleAction(self, mousePoint)
                            }
                        })
                        
                        /**
                         * fungsi ini melakukan perhitungan pergerakan vertex garis maupun garis tersebut tersendiri
                         * sesuai dengan pergerakan mouse
                         * @param {Line} self 
                         * @param {JSON} mousePoint 
                         */
                        const lineMoveMoveAction = (self, mousePoint) => {
                            if(pointChosenLine !== -1) {
                                self.setPoint(pointChosenLine, mousePoint)
                            }
    
                            if(lineChosen) {
                                const pointCount = self.getPointCount()
                                for(let i = 0; i < pointCount; ++i) {
                                    self.setPoint(i, {
                                        x: mousePoint.x + offset[i].x,
                                        y: mousePoint.y + offset[i].y
                                    })
                                }
                            }
                        }
    
                        /**
                         * fungsi ini berfungsi untuk melakukan perhitungan rotasi garis sesuai dengan pergerakan mouse
                         * @param {Line} self 
                         * @param {JSON} mousePoint 
                         */
                        const lineMoveRotateAction = (self, mousePoint) => {
                            if(lineChosen) {
                                const gradient1 = calculateGradient(mousePrevious, lineMidpoint)
                                const gradient2 = calculateGradient(mousePoint, lineMidpoint)
    
                                const dividend = gradient1 - gradient2
                                const divisor = 1 + (gradient1 * gradient2)
    
                                const angle = Math.atan(dividend / divisor) * -1
    
                                const linePoints = self.getPoints()
                                const pointCount = line.getPointCount()
    
                                for(let i = 0; i < pointCount; ++i) {
                                    const temp = linePoints[i]
    
                                    const s = Math.sin(angle)
                                    const c = Math.cos(angle)
    
                                    const newPoint = {
                                        x: temp.x - lineMidpoint.x,
                                        y: temp.y - lineMidpoint.y
                                    }
                                    
                                    const rotatedPoint = {
                                        x: newPoint.x * c - newPoint.y * s,
                                        y: newPoint.x * s + newPoint.y * c
                                    }
    
                                    rotatedPoint.x += lineMidpoint.x
                                    rotatedPoint.y += lineMidpoint.y
    
                                    self.setPoint(i, rotatedPoint)
                                }
    
                                mousePrevious = mousePoint
                            }
                        }
    
                        /**
                         * fungsi ini berfungsi untuk melakukan perhitungan skala sesuai dengan pergerakan mouse
                         * @param {Line} self 
                         * @param {JSON} mousePoint 
                         */
                        const lineMoveScaleAction = (self, mousePoint) => {
                            if(lineChosen) {
                                const diffX = mousePoint.x / mousePrevious.x
    
                                const scale = diffX
                        
                                const linePoints = self.getPoints()
                        
                                for(let i = 0; i < linePoints.length; ++i) {
                                    const newPoint = {
                                        x: linePoints[i].x * scale,
                                        y: linePoints[i].y
                                    }
                        
                                    self.setPoint(i, newPoint)
                                }
                        
                                mousePrevious = mousePoint
                            }
                        }
    
                        /**
                         * menambahkan onmove event callback kepada garis.
                         * callback inilah yang menghandle fungsi manakah yang dipanggil tergantung dengan keadaan tool
                         */
                        obj.addOnMoveEvent((self, mousePoint) => {
                            if(toolState === ToolState.Move) {
                                lineMoveMoveAction(self, mousePoint)
                            } else if(toolState === ToolState.Rotate) {
                                lineMoveRotateAction(self, mousePoint)
                            } else if(toolState === ToolState.Scale) {
                                lineMoveScaleAction(self, mousePoint)
                            }
                        })
    
                        /**
                         * menambahkan ondrop event kepada garis
                         */
                        obj.addOnDropEvent((self, mousePoint) => {
                            pointChosenLine = -1
                            lineChosen = false
                        })
                    })()
                } else if(obj instanceof Square) {
                    (() => {
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

                        obj.addOnClickEvent((self, mousePoint) => {
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

                        obj.addOnMoveEvent((self, mousePoint) => {
                            if(toolState === ToolState.Move) {
                                squareMoveMoveAction(self, mousePoint)
                            } else if(toolState === ToolState.Rotate) {
                                squareMoveRotateAction(self, mousePoint)
                            } else if(toolState === ToolState.Scale) {
                                squareMoveScaleAction(self, mousePoint)
                            }
                        })
                        
                        obj.addOnDropEvent((self, mousePoint) => {
                            pointChosen = -1
                            squareChosen = false

                        })

                    })()
                } else if(obj instanceof Rectangle) {
                    (() => {
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

                        obj.addOnClickEvent((self, mousePoint) => {
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

                        obj.addOnMoveEvent((self, mousePoint) => {
                            if(toolState === ToolState.Move) {
                                rectangleMoveMoveAction(self, mousePoint)
                            } else if(toolState === ToolState.Rotate) {
                                rectangleMoveRotateAction(self, mousePoint)
                            } else if(toolState === ToolState.Scale) {
                                rectangleMoveScaleAction(self, mousePoint)
                            }
                        })
                        
                        obj.addOnDropEvent((self, mousePoint) => {
                            pointChosen = -1
                            rectangleChosen = false

                        })
                    })()
                }
            }
        };
    }
})