/**
 * Preview berfungsi untuk menampilkan hasil yang terjadi apabila kita menambahkan titik
 * di polygon
 */
class Preview {
    constructor() {
        this.length = 1

        //this variable stores only x, y
        this.vertexes = [
            -0.5, -0.5,
            -0.5, 0.5,
            0.5, 0.5,
        ]

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

        gl.useProgram(this.program)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexes.length / 2)
    }

    setPoint(index, newPoint) {
        const setIndex = index * 2
        this.vertexes[setIndex] = newPoint.x
        this.vertexes[setIndex + 1] = newPoint.y
    }
}