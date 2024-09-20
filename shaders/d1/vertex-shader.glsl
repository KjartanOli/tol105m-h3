attribute vec4 vPosition;
uniform mat4 transform;

void
main()
{
	gl_PointSize = 1.0;
    gl_Position = transform * vPosition;
}
