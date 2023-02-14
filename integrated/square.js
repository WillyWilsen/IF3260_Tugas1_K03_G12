class Square {

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

    constructor() {
        this.length = 1

        //this variable stores only x, y
        this.vertexes = [
            -0.5, -0.5,
            -0.5, 0.5,
            0.5, 0.5,
            0.5, -0.5
        ]

        //this variable stores x, y, z
        this.color = [
            1, 1, 1,
            1, 1, 1,
            1, 1, 1,
            1, 1, 1
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
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
    }
    /**
     * point contains two property, which is x and y
     * @param {JSON} point 
     */
    checkPointInside(point) {
        let result = false

        const offset = this.getPoints()

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
            
            const intersectX = gradient === Infinity ? point1.x : gradient === -Infinity ? point1.x : (point.y - constant) / gradient

            if(intersectX > point.x && (intersectX <= point1.x || intersectX <= point2.x)) {
                result = !result
            }
        }

        return result
    }

    getPoint(index) {
        const getIndex = index * 2

        return {
            x: this.vertexes[getIndex],
            y: this.vertexes[getIndex+1]
        }
    }

    getPoints() {
        const result = []
        for(let i = 0; i < this.vertexes.length; i += 2) {
            result.push({
                x: this.vertexes[i],
                y: this.vertexes[i+1]
            })
        }

        return result
    }

    getPointCount() {
        return this.vertexes.length / 2
    }

    setPoint(index, newPoint) {
        const setIndex = index * 2
        this.vertexes[setIndex] = newPoint.x
        this.vertexes[setIndex+1] = newPoint.y
    }

    getColor(index) {
        const getIdx = index * 3
        const color = {
            r: this.color[getIdx],
            g: this.color[getIdx + 1],
            b: this.color[getIdx + 2]
        }

        return color
    }

    setColor(index, newColor) {
        const setIndex = index * 3
        this.color[setIndex] = newColor.r
        this.color[setIndex + 1] = newColor.g
        this.color[setIndex + 2] = newColor.b
    }

    onClick(mousePoint) {
        for(let i = 0; i < this.onClickEvent.length; ++i) {
            this.onClickEvent[i](this, mousePoint)
        }
    }

    /**
     * 
     * @param {function(Square, JSON)} cb 
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
     * @param {function(Square, JSON)} cb 
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
     * @param {function(Square, JSON)} cb 
     */
    addOnDropEvent(cb) {
        this.onDropEvent.push(cb)
    }
}