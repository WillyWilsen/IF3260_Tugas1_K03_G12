class Selected {
    constructor() {
        this.vertexShaderCode = `
        attribute vec2 position;

        void main() {
            gl_Position = vec4(position, 0, 1);
        }
        `

        this.fragmentShaderCode = `
        void main() {
            gl_FragColor = vec4(0, 0, 0, 1);
        }
        `

        this.vertexes = []
        this.position = {
            x: 0, y: 0
        }

        this.radius = 0.03
        this.program = undefined

        this.setPosition(this.position)
    }

    /**
     * 
     * @param {WebGLRenderingContext} gl 
     */
    init(gl) {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vertexShader, this.vertexShaderCode)
        gl.compileShader(vertexShader)
        if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(vertexShader))
        }

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fragmentShader, this.fragmentShaderCode)
        gl.compileShader(fragmentShader)
        if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) [
            console.error(gl.getShaderInfoLog(fragmentShader))
        ]

        this.program = gl.createProgram()
        gl.attachShader(this.program, vertexShader)
        gl.attachShader(this.program, fragmentShader)

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

        gl.useProgram(this.program)
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 100)
    }

    setPosition(newPos) {
        this.position = newPos
        this.vertexes.length = 0
        
        this.vertexes.push(this.position.x)
        this.vertexes.push(this.position.y)

        for(let i = 0; i < 100; ++i) {
            const temp = {
                x: this.radius * Math.cos(i * 2 * Math.PI / 100),
                y: this.radius * Math.sin(i * 2 * Math.PI / 100)
            }

            this.vertexes.push(this.position.x + temp.x)
            this.vertexes.push(this.position.y + temp.y)
        }
    }
}