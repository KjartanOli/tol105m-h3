precision mediump float;
uniform float time;
uniform vec2 resolution;

void main()
{
	vec4 color;

	// Fá stöðluð hnit bútar (gl_FragCoord er í skjáhnitum)
	vec2 st = gl_FragCoord.xy / resolution.xy;

	// Breytum þeim í -1 til 1
	st = 2.0*st - 1.0;

  st += vec2(0.0, sin(time * 0.0005));
	if (length(st) < 0.1)
		color = vec4(1.0, 1.0, 0.0, 1.0);	// Gulur
	else
		color = vec4(0.0, 0.0, 1.0, 1.0);	// Blár

	gl_FragColor = color;
}
