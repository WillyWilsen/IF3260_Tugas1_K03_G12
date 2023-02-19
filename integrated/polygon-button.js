/**
 * fungsi ini berguna untuk memasukkan polygon ke dalam canvas
 * dan menambahkan aksi yang dilakukan untuk masing masing event
 * onclick, onmove, ondrop
 */
polygonBtn.addEventListener("click", () => {
    const polygon = new Polygon()
    polygon.init(gl)
    canvas_data.add(polygon)

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
     * Menambahkan callback kepada polygon
     * di callback inilah dihandle function mana yang dipanggil tergantung tool
     */
    polygon.addOnClickEvent((self, mousePoint) => {
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
    polygon.addOnMoveEvent((self, mousePoint) => {
        if(toolState === ToolState.Move) {
            polygonMoveMoveAction(self, mousePoint)
        } else if(toolState === ToolState.Rotate) {
            polygonMoveRotateAction(self, mousePoint)
        } else if(toolState === ToolState.Scale) {
            polygonMoveScaleAction(self, mousePoint)
        }
    })
    
    polygon.addOnDropEvent((self, mousePoint) => {
        pointChosen = -1
        polygonChosen = false

    })

    object.push(polygon)
})