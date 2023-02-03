// vertexData
var vertexData = [
    // square
    0.5, 0.5,
    0.5, -0.5,
    -0.5, -0.5,
    -0.5, 0.5
];
var interval;
var vertex_idx;

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

    // render
    render(gl, vertexData);

    // interval for rotate
    interval = setInterval(function() {
        vertexData = rotate(vertexData, 1);
        // render
        render(gl, vertexData);
    }, 10);

    canvas.onmouseenter = function() {
        clearInterval(interval);
    };

    canvas.onmouseleave = function() {
        interval = setInterval(function() {
            vertexData = rotate(vertexData, 1);
            // render
            render(gl, vertexData);
        }, 10);
    }


    // slider for corner point
    canvas.onmousedown = function(e) {
        x = ((e.clientX - e.target.offsetLeft - canvas.width / 2) / (canvas.width / 2)).toFixed(2);
        y = ((-1) * (e.clientY - e.target.offsetTop - canvas.height / 2) / (canvas.height / 2)).toFixed(2);
        for (let i = 0; i < vertexData.length; i += 2) {
            if ((x >= vertexData[i].toFixed(2) - 0.05 && x <= vertexData[i].toFixed(2) + 0.05) 
            && (y >= vertexData[i + 1].toFixed(2) - 0.05 && y <= vertexData[i + 1].toFixed(2) + 0.05)) {
                vertex_idx = i;
            }
        }
    }

    canvas.onmouseup = function(e) {
        if (vertex_idx != null) {
            x = (e.clientX - e.target.offsetLeft - canvas.width / 2) / (canvas.width / 2);
            y = (-1) * (e.clientY - e.target.offsetTop - canvas.height / 2) / (canvas.height / 2);
            vertexData[vertex_idx] = x;
            vertexData[vertex_idx + 1] = y;
            render(gl, vertexData);
            vertex_idx = null;
        }
    }
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
    // clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // load vertexData into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    // draw
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}