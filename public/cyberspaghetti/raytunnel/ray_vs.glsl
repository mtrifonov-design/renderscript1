vec3 centerPoint = vec3(0.0,0.0,1.0);
float radius1 = 0.1;
float radius2 = 0.5;

#include "/cyberspaghetti/raytunnel/projection_rotation_translation.glsl";

void main() {
    mat4 t = translation(vec3(0.0, 0.5, 0.0));
    mat4 r = rotation(vec3(.0, 1.0, 0.0), 15.0);
    mat4 p = perspective_projection(16.0/9.0, 45.0, 0.01, 100.0);
    gl_Position = p * r * vec4(position, -5.0, 1.0);
}