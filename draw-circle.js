"use strict";

import { get_shader, init_shaders } from './shaders.js';

const [vertex_shader, fragment_shader] = [
	'shaders/d2/vertex-shader.glsl',
	'shaders/d2/fragment-shader.glsl'
].map(get_shader);


let gl = null;
let program = null;
let locTime = null;
let iniTime = null;

export async function init() {
	const canvas = document.querySelector("#d2-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert( "WebGL isn't available" ); }

	//
	// Configure WebGL
	//
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	//Load shaders and initialize attribute buffers
	program = await init_shaders(gl, await vertex_shader, await fragment_shader);
	gl.useProgram(program);

	//  The vertices of a square, filling the whole canvas
	const vertices = [
		vec2(-1, -1), vec2(1, -1), vec2(1, 1),
		vec2(-1, -1), vec2(1, 1), vec2(-1, 1)
	];

	// Load the data into the GPU
	const bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

	// Associate shader variables with our data buffer
	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	locTime = gl.getUniformLocation(program, "time");
	iniTime = Date.now();

	const canvasRes = vec2(canvas.width, canvas.height);
	gl.uniform2fv(gl.getUniformLocation(program, "resolution"), flatten(canvasRes));

	render();
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);

	const msek = Date.now() - iniTime;
	gl.uniform1f(locTime, msek);
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	window.requestAnimFrame(render);
}
