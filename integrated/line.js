class Line {
    /**
     * this variable consists of callback functions which has two parameter
     * self and event
     */
    onClickEvent = []
    /**
     * this variable consists of callback functions which has two parameter
     * self and event
     */
    onMoveEvent = []
    /**
     * this variable consists of callback functions which has two parameter
     * self and event
     */
    onDropEvent = []
    /**
     * this variable is to store extra property that might be used
     */
    extraProperty = {}
    constructor() {
        this.length = 1

        //this variable stores only x, y
        this.vertexes = [
            0, 0,
            1, 0
        ]

        //this variable stores x, y, z
        this.color = [
            0, 0, 0,
            1, 0, 0
        ]

        this.vertexShaderCode = `
        attribute vec2 position;
        attribute vec3 color;
        varying vec3 vColor;

        void main() {
            gl_Position = vec4(position, 0, 1);
            vColor = color;
        }
        `

        this.fragmentShaderCode = `
        precision mediump float;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1);
        }
        `

        this.program = undefined
        this.vertexShader = undefined
        this.fragmentShader = undefined
    }

    /**
     * 
     * @param {WebGLRenderingContext} gl 
     */
    init(gl) {
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(this.vertexShader, this.vertexShaderCode)
        gl.compileShader(this.vertexShader)
        if(!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(this.vertexShader))
        }

        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(this.fragmentShader, this.fragmentShaderCode)
        gl.compileShader(this.fragmentShader)
        if(!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(this.fragmentShader))
        }

        this.program = gl.createProgram()

        gl.attachShader(this.program, this.vertexShader)
        gl.attachShader(this.program, this.fragmentShader)
        gl.linkProgram(this.program)
    }

    /**
     * 
     * @param {WebGLRenderingContext} gl 
     */
    draw(gl) {
        
        const vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexes), gl.STATIC_DRAW)

        const vertexPosition = gl.getAttribLocation(this.program, 'position')
        gl.enableVertexAttribArray(vertexPosition)
        gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0)

        const fragmentBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, fragmentBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.color), gl.STATIC_DRAW)

        const colorPosition = gl.getAttribLocation(this.program, 'color')
        gl.enableVertexAttribArray(colorPosition)
        gl.vertexAttribPointer(colorPosition, 3, gl.FLOAT, false, 0, 0)

        gl.useProgram(this.program)
        gl.drawArrays(gl.LINES, 0, 2)
    }

    setPoint(index, newPoint) {
        const setIndex = index * 2
        this.vertexes[setIndex] = newPoint.x
        this.vertexes[setIndex+1] = newPoint.y
    }

    getPoint(index) {
        const result = {
            x: this.vertexes[index * 2],
            y: this.vertexes[(index * 2) + 1]
        }
        return result
    }

    getPoints() {
        const results = []
        for(let i = 0; i < this.vertexes.length; i += 2) {
            results.push({
                x: this.vertexes[i],
                y: this.vertexes[i+1]
            })
        }
        return results
    }

    getPointCount() {
        return this.vertexes.length / 2
    }

    getColor(index) {
        const getIndex = index * 3
        const color = {
            r: this.color[getIndex],
            g: this.color[getIndex + 1],
            b: this.color[getIndex + 2]
        }
        return color
    }

    setColor(index, newColor) {
        const setIndex = index * 3
        this.color[setIndex] = newColor.r
        this.color[setIndex + 1] = newColor.g
        this.color[setIndex + 2] = newColor.b
    }

    /**
     * point contains two property, which is x and y
     * @param {JSON} point 
     */
    checkPointInside(point) {
        const firstPoint = {
            x: this.vertexes[0],
            y: this.vertexes[1]
        }

        const secondPoint = {
            x: this.vertexes[2],
            y: this.vertexes[3]
        }

        const offset = this.generateOffset(firstPoint, secondPoint)

        let result = false

        for(let i = 0; i < offset.length; i++) {
            const point1 = offset[i % offset.length]
            const point2 = offset[(i+1) % offset.length]

            const pointBetweenY = point1.y < point.y && point.y < point2.y
            const pointBetweenY2 = point2.y < point.y && point.y < point1.y

            if(!(pointBetweenY || pointBetweenY2)) {
                continue
            }

            const gradient = calculateGradient(point1, point2)
            const constant = calculateConstant(gradient, point1)

            const intersectX = gradient === Infinity ? point1.x : (point.y - constant) / gradient

            if(intersectX > point.x && (intersectX <= point1.x || intersectX <= point2.x)) {
                result = !result
            }
        }

        return result
    }

    /**
     * fungsi ini berfungsi untuk membentuk sebuah kotak kecil yang mengelilingi garis.
     * cara kerjanya adalah menggunakan proyeksi vektor
     * @param {JSON} first 
     * @param {JSON} second 
     * @returns 
     */
    generateOffset(first, second) {
        return [
            this.generateOffsetPoint(first, second, true),
            this.generateOffsetPoint(first, second, false),
            this.generateOffsetPoint(second, first, true),
            this.generateOffsetPoint(second, first, false)
        ]
    }
    
    /**
     * 
     * @param {JSON} first 
     * @param {JSON} second 
     * @param {boolean} isLeft 
     */
    generateOffsetPoint(first, second, isLeft) {
        const negMult = isLeft ? 1 : -1

        const diffY = first.y - second.y
        const diffX = first.x - second.x

        const distance = Math.sqrt(diffY * diffY + diffX * diffX)
        const angle = Math.atan2(diffY, diffX)
        
        const lineWidth = 0.05

        const tempPoint = {
            x: lineWidth * Math.cos(angle),
            y: lineWidth * Math.sin(angle)
        }

        const result = {
            x: (negMult * -1 * tempPoint.y) + first.x,
            y: (negMult * tempPoint.x) + first.y
        }

        return result
    }

    onClick(mousePoint) {
        for(let i = 0; i < this.onClickEvent.length; ++i) {
            this.onClickEvent[i](this, mousePoint)
        }
    }

    /**
     * 
     * @param {function(Line, JSON)} cb 
     */
    addOnClickEvent(cb) {
        this.onClickEvent.push(cb)
    }

    onMove(mousePoint) {
        for(let i = 0; i < this.onMoveEvent.length; ++i) {
            this.onMoveEvent[i](this, mousePoint)
        }
    }

    /**
     * 
     * @param {function(Line, JSON)} cb 
     */
    addOnMoveEvent(cb) {
        this.onMoveEvent.push(cb)
    }

    onDrop(mousePoint) {
        for(let i = 0; i < this.onDropEvent.length; ++i) {
            this.onDropEvent[i](this, mousePoint)
        }
    }

    /**
     * 
     * @param {function(Line, JSON)} cb 
     */
    addOnDropEvent(cb) {
        this.onDropEvent.push(cb)
    }
}