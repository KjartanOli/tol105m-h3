"use strict";

import { get_shader, init_shaders } from './shaders.js';

const [vertex_shader, fragment_shader] = [
	'shaders/d1/vertex-shader.glsl',
	'shaders/d1/fragment-shader.glsl'
].map(get_shader);


let gl = null;
let program = null;
let mouse_start = null;
let translation = translate(0, 0, 0);

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
	set_colour(vec4(1.0, 0.0, 0.0, 1.0));
	set_transform(translation);

	setup_points(num_points);
	canvas.addEventListener('mousedown', (event) => {
		if (event.button === 0) {
			mouse_start = get_cursor_location(event);
			canvas.addEventListener('mousemove', move_mouse);
		}
	});

	canvas.addEventListener('mouseup', (event) => {
		if (event.button === 0)
			canvas.removeEventListener('mousemove', move_mouse);
	});

	window.addEventListener('keydown', (event) => {
		if (event.key !== ' ')
			return;

		change_colour();
		event.preventDefault();
	});
	render();
};

function get_cursor_location(event) {
	const canvas = event.target;

	const x = (event.offsetX / canvas.clientWidth) * 2 - 1;
	const y = -((event.offsetY / canvas.clientHeight) * 2 - 1);
	return vec2(x, y);
}

function move_mouse(event) {
	const location = get_cursor_location(event);
	const delta = negate(subtract(mouse_start, location));
	translation = translate(delta[0], delta[1], 0);
	set_transform(mult(translation, scalem(zoom, zoom, zoom)));
}

function change_colour() {
	set_colour(vec4(Math.random(), Math.random(), Math.random(), 1.0));
}


function set_transform(transform) {
	gl.uniformMatrix4fv(gl.getUniformLocation(program, 'transform'), false, flatten(transform));
}

function set_colour(colour) {
	const ucolour = gl.getUniformLocation(program, 'colour');
	gl.uniform4fv(ucolour, colour);
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
	gl.drawArrays(gl.POINTS, 0, num_points);

	window.requestAnimFrame(render);
}
