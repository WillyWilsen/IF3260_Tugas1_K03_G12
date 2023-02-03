// vertexData
var vertexData = [
    // square
    0.5, 0.5,
    0.5, -0.5,
    -0.5, -0.5,
    -0.5, 0.5
];
var colors = [
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1
]
var interval;
var vertex_idx;

window.onload = function init() {
    const canvas = document.getElementById('square-canvas');
    const save_btn = document.getElementById('save-btn');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        throw new Error('WebGL not supported');
    }

    // create vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
    precision mediump float;
    attribute vec2 position;
    attribute vec3 color;
    varying vec3 vColor;
    void main() {
        gl_Position = vec4(position, 0, 1);
        vColor = color;
    }
    `);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error(gl.getShaderInfoLog(vertexShader));
    }

    // create fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
    precision mediump float;
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4(vColor, 1);
    }
    `);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error(gl.getShaderInfoLog(fragmentShader));
    }

    // create program
    const program = gl.createProgram();

    // attach shaders to program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error(gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    // render
    render(gl, program);

    // interval for rotate
    interval = setInterval(function() {
        vertexData = rotate(vertexData, 1);
        // render
        render(gl, program);
    }, 10);

    canvas.onmouseenter = function() {
        clearInterval(interval);
    };

    canvas.onmouseleave = function() {
        interval = setInterval(function() {
            vertexData = rotate(vertexData, 1);
            // render
            render(gl, program);
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
            render(gl, program);
            vertex_idx = null;
        }
    }

    // save file
    save_btn.onclick = function() {
        var vertexString = '';
        for (let i = 0; i < vertexData.length; i += 2) {
            vertexString += `${vertexData[i]} ${vertexData[i + 1]}\n`
        }
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([vertexString], {type: 'text/plain'}));
        a.download = 'square.txt';
        a.click();
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

function render(gl, program) {
    // create vertex buffer
    const vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    // load vertexData into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    // enable vertex attributes
    const position = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // create color buffer
    const color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);

    // load color into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // enable color attributes
    const color = gl.getAttribLocation(program, `color`);
    gl.enableVertexAttribArray(color);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);

    // draw
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}