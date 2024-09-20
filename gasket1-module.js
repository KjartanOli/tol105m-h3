"use strict";

import { get_shader, init_shaders } from './shaders.js';

const [vertex_shader, fragment_shader] = [
	'shaders/d1/vertex-shader.glsl',
	'shaders/d1/fragment-shader.glsl'
].map(get_shader);


let gl = null;
let program = null;
let colour = vec4(1.0, 0.0, 0.0, 1.0);

const num_points = 50000;

export async function init()
{
	const canvas = document.querySelector("#d1-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert( "WebGL isn't available" ); }

	//
	//	Configure WebGL
	//
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	//	Load shaders and initialize attribute buffers

	program = await init_shaders(gl, await vertex_shader, await fragment_shader);
	gl.useProgram(program);

	setup_points(num_points);
	window.addEventListener('keydown', (event) => {
		if (event.key !== ' ')
			return;

		change_colour();
		event.preventDefault();
	});
	render();
};

function change_colour() {
	colour = vec4(Math.random(), Math.random(), Math.random(), 1.0);
}

function setup_points(num_points) {
	// Load the data into the GPU
	const points = create_points(num_points);
	const bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

	// Associate out shader variables with our data buffer
	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( vPosition );
}

function create_points(num_points) {
	//
	//	Initialize our data for the Sierpinski Gasket
	//

	// First, initialize the corners of our gasket with three points.

	const vertices = [
		vec2(-1, -1),
		vec2(0, 1),
		vec2(1, -1),
	];

	// Specify a starting point p for our iterations
	// p must lie inside any set of three vertices

	let p = vec2(100, 100);

	// And, add our initial point into our array of points

	const points = [ p ];

	// Compute new points
	// Each new point is located midway between
	// last point and a randomly chosen vertex

	for ( var i = 0; points.length < num_points; ++i ) {
		var j = Math.floor(Math.random() * 3);
		p = add( points[i], vertices[j] );
		p = scale( 0.5, p );
		points.push( p );
	}

	return points;
}


function render() {
	gl.clear(gl.COLOR_BUFFER_BIT );
	const ucolour = gl.getUniformLocation(program, 'colour');
	gl.uniform4fv(ucolour, colour);
	gl.drawArrays(gl.POINTS, 0, num_points);

	window.requestAnimFrame(render);
}
