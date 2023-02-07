// vertexData
var vertexData;
var colors;
var is_rotating;
var interval;
var vertex_idx;
var x, y;

window.onload = function init() {
    const load_file = document.getElementById('load-file');
    const web_gl = document.getElementById('web-gl');
    const canvas = document.getElementById('polygon-canvas');
    const save_btn = document.getElementById('save-btn');
    const translation = document.getElementById('translation');
    const rotate = document.getElementById('rotate');
    const move_corner = document.getElementById('move-corner');
    const color_corner = document.getElementById('color-corner');
    const rgb_form = document.getElementById('rgb-form');
    const r = document.getElementById('r');
    const g = document.getElementById('g');
    const b = document.getElementById('b');
    const rgb_all = document.getElementById('rgb-all');
    const radioButtons = document.querySelectorAll('input[name="choice"]')

    // READ FILE
    load_file.onchange = function(e) {
        const fr = new FileReader();
        fr.readAsText(e.target.files[0]);
        fr.onload = function() {
            vertexData = JSON.parse(fr.result.split('\r\n')[0]);
            colors = JSON.parse(fr.result.split('\r\n')[2]);
            web_gl.hidden = false;
            load_file.hidden = true;
            // render
            render(gl, program);
        };
    }
    
    // create gl
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

    // ROTATE
    rotate.onclick = function() {
        if (!is_rotating) {
            rgb_form.hidden = true;
            is_rotating = true;
            interval = setInterval(function() {
                vertexData = rotateVertex(vertexData, 1);
                // render
                render(gl, program);
            }, 10);
        }
    }

    move_corner.onclick = function() {
        clearInterval(interval); 
        rgb_form.hidden = true;
        is_rotating = false;
    }

    color_corner.onclick = function() {
        clearInterval(interval);
        rgb_form.hidden = false;
        is_rotating = false;
    }

    translation.onclick = function() {
        clearInterval(interval);
        rgb_form.hidden = true;
        is_rotating = false;
    }

    canvas.onmousedown = function(e) {
        // MOVE CORNER POINT (MOUSE DOWN)
        if (getChoice(radioButtons) === "move-corner") {
            x = ((e.clientX - e.target.offsetLeft - canvas.width / 2) / (canvas.width / 2)).toFixed(2);
            y = ((-1) * (e.clientY - e.target.offsetTop - canvas.height / 2) / (canvas.height / 2)).toFixed(2);
            for (let i = 0; i < vertexData.length; i += 2) {
                if ((x >= vertexData[i].toFixed(2) - 0.05 && x <= vertexData[i].toFixed(2) + 0.05) 
                && (y >= vertexData[i + 1].toFixed(2) - 0.05 && y <= vertexData[i + 1].toFixed(2) + 0.05)) {
                    vertex_idx = i;
                }
            }
        // COLOR CORNER POINT
        } else if (getChoice(radioButtons) == "color-corner") {
            if (isValidRGB(r, g, b)) {
                x = ((e.clientX - e.target.offsetLeft - canvas.width / 2) / (canvas.width / 2)).toFixed(2);
                y = ((-1) * (e.clientY - e.target.offsetTop - canvas.height / 2) / (canvas.height / 2)).toFixed(2);
                for (let i = 0; i < vertexData.length; i += 2) {
                    if ((x >= vertexData[i].toFixed(2) - 0.05 && x <= vertexData[i].toFixed(2) + 0.05) 
                    && (y >= vertexData[i + 1].toFixed(2) - 0.05 && y <= vertexData[i + 1].toFixed(2) + 0.05)) {
                        colors[i / 2 * 3] = r.value / 255;
                        colors[i / 2 * 3 + 1] = g.value / 255;
                        colors[i / 2 * 3 + 2] = b.value / 255;
                        // render
                        render(gl, program);
                    }
                }   
            }
        // TRANSLATION (MOUSE DOWN)
        } else if (getChoice(radioButtons) == "translation") {
            x = ((e.clientX - e.target.offsetLeft - canvas.width / 2) / (canvas.width / 2)).toFixed(2);
            y = ((-1) * (e.clientY - e.target.offsetTop - canvas.height / 2) / (canvas.height / 2)).toFixed(2);
        }
    }

    canvas.onmouseup = function(e) {
        // MOVE CORNER POINT (MOUSE UP)
        if (getChoice(radioButtons) === "move-corner" && vertex_idx != null) {
            x = (e.clientX - e.target.offsetLeft - canvas.width / 2) / (canvas.width / 2);
            y = (-1) * (e.clientY - e.target.offsetTop - canvas.height / 2) / (canvas.height / 2);
            vertexData[vertex_idx] = x;
            vertexData[vertex_idx + 1] = y;
            // render
            render(gl, program);
            vertex_idx = null;
        
        } else if (getChoice(radioButtons) === "translation") {
            x_drop = (e.clientX - e.target.offsetLeft - canvas.width / 2) / (canvas.width / 2);
            y_drop = (-1) * (e.clientY - e.target.offsetTop - canvas.height / 2) / (canvas.height / 2);
            x_translation = x_drop - x;
            y_translation = y_drop - y;
            for (let i = 0; i < vertexData.length; i += 2) {
                vertexData[i] += x_translation;
                vertexData[i + 1] += y_translation;
            }
            // render
            render(gl, program);
        }
    }

    // COLOR ALL CORNER POINT
    rgb_all.onclick = function() {
        if (isValidRGB(r, g, b)) {
            for (let i = 0; i < colors.length; i += 3) {
                colors[i] = r.value / 255;
                colors[i + 1] = g.value / 255;
                colors[i + 2] = b.value / 255;
                // render
                render(gl, program);
            }
        }
    }

    // SAVE FILE
    save_btn.onclick = function() {
        var vertexString = '[';
        for (let i = 0; i < vertexData.length; i++) {
            vertexString += `${vertexData[i]}`
            if (i != vertexData.length - 1) {
                vertexString += ', ';
            }
        }
        vertexString += ']\r\n\r\n[';
        for (let i = 0; i < colors.length; i++) {
            vertexString += `${colors[i]}`
            if (i != colors.length - 1) {
                vertexString += ', ';
            }
        }
        vertexString += ']';
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([vertexString], {type: 'text/plain'}));
        a.download = 'polygon.txt';
        a.click();
    }
}

function getChoice(radioButtons) {
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            return radioButton.value;
        }
    }
    return null;
}

function isValidRGB(r, g, b) {
    return r.value >= 0 && r.value <= 255 && g.value >= 0 && g.value <= 255 && b.value >= 0 && b.value <= 255;
}

function rotateVertex(vertexData, angle) {
    const radians = (angle * Math.PI) / 180.0;
    const newVertex = [];
    for (let i = 0; i < vertexData.length; i += 2) {
        newVertex.push(Math.cos(radians) * vertexData[i] - Math.sin(radians) * vertexData[i + 1]);
        newVertex.push(Math.sin(radians) * vertexData[i] + Math.cos(radians) * vertexData[i + 1]);
    }
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
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexData.length / 2);
}