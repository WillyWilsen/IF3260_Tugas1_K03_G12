// vertexData
var vertexData = [
    // square
    0.5, 0.5,
    0.5, -0.5,
    -0.5, -0.5,
    -0.5, 0.5
];

window.onload = function init() {
    const canvas = document.getElementById('square-canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        throw new Error('WebGL not supported');
    }

    // create buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // create vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
    attribute vec3 position;
    void main() {
        gl_Position = vec4(position, 1);
    }
    `);
    gl.compileShader(vertexShader);

    // create fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
    void main() {
        gl_FragColor = vec4(${Math.random()}, ${Math.random()}, ${Math.random()}, 1);
    }
    `);
    gl.compileShader(fragmentShader);

    // create program
    const program = gl.createProgram();

    // attach shaders to program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // enable vertex attributes
    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);

    const interval = setInterval(function() {
        vertexData = rotate(vertexData, 1);
        // render
        render(gl, vertexData);
    }, 10);
}

function rotate(vertexData, angle) {
    const radians = (angle * Math.PI) / 180.0;
    const newVertex = [];
    newVertex.push(Math.cos(radians) * vertexData[0] - Math.sin(radians) * vertexData[1]);
    newVertex.push(Math.sin(radians) * vertexData[0] + Math.cos(radians) * vertexData[1]);
    newVertex.push(Math.cos(radians) * vertexData[2] - Math.sin(radians) * vertexData[3]);
    newVertex.push(Math.sin(radians) * vertexData[2] + Math.cos(radians) * vertexData[3]);
    newVertex.push(Math.cos(radians) * vertexData[4] - Math.sin(radians) * vertexData[5]);
    newVertex.push(Math.sin(radians) * vertexData[4] + Math.cos(radians) * vertexData[5]);
    newVertex.push(Math.cos(radians) * vertexData[6] - Math.sin(radians) * vertexData[7]);
    newVertex.push(Math.sin(radians) * vertexData[6] + Math.cos(radians) * vertexData[7]);
    return newVertex;
}

function render(gl, vertexData) {
    // load vertexData into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    // draw
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}