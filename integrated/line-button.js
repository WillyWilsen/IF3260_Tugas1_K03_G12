/**
 * fungsi ini berguna untuk memasukkan line ke dalam canvas
 * dan menambahkan aksi yang dilakukan untuk masing masing event
 * onclick, onmove, ondrop
 */
lineBtn.onclick = () => {
    const line = new Line()
    line.init(gl)
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
    line.addOnClickEvent((self, mousePoint) => {
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
    line.addOnMoveEvent((self, mousePoint) => {
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
    line.addOnDropEvent((self, mousePoint) => {
        pointChosenLine = -1
        lineChosen = false
    })
    object.push(line)
}
