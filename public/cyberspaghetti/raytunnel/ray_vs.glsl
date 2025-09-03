vec3 centerPoint = vec3(0.0,0.0,1.0);
float radius1 = 0.1;
float radius2 = 0.5;

#include "/cyberspaghetti/raytunnel/projection_rotation_translation.glsl";
#include "/cyberspaghetti/raytunnel/randomness.glsl";

float angle = 90.;
float ray_length = 1.;
float ray_progress = .5;
float ray_thickness = 0.01;
float lifecycle = 50.;

mat4 generateRayPositions(float nCD, float nCR, float fCD, float fCR, float angle, float ray_length, float ray_progress, float ray_thickness) {
    vec3 nearPoint = vec3(nCR * sin(radians(angle)), nCR * cos(radians(angle)), nCD);
    vec3 farPoint = vec3(fCR * sin(radians(angle)), fCR * cos(radians(angle)), fCD);
    vec3 delta = -(farPoint - nearPoint);
    float ray_full_length = length(delta);
    float computed_progress = ray_progress * (1. + ray_length) - ray_length;
    vec3 rayStart = farPoint + computed_progress * delta;
    vec3 rayEnd = farPoint + (ray_length + computed_progress) * delta;
    vec2 normal = vec2(sin(radians(angle)), cos(radians(angle)));
    vec2 orthogonal_to_normal = vec2(-normal.y, normal.x);
    vec2 o = orthogonal_to_normal;

    return mat4(
        vec4(rayStart + vec3(o * ray_thickness,0.0),1.0),
        vec4(rayStart - vec3(o * ray_thickness,0.0),1.0),
        vec4(rayEnd + vec3(o * ray_thickness,0.0),1.0),
        vec4(rayEnd - vec3(o * ray_thickness,0.0),1.0)
    );
}

int positionToIndex(vec2 position) {
    // map (-1,-1) to 0, (-1,1) to 1, (1,-1) to 2, (1,1) to 3
    int x = position.x == -1.0 ? 0 : 1;
    int y = position.y == -1.0 ? 0 : 1;
    return x + y * 2;
}

mat4 debugPositions() {
    return mat4(
        vec4(-.5,-.5,-1.,1.0),
        vec4(-.5,.5,-1.,1.0),
        vec4(.2,-.2,-1.,1.0),
        vec4(.2,.2,-1.,1.0)
    );
}

struct ParticleParams {
    float progress;
    uint incarnation;
    float angle;
};

ParticleParams ppar_for(uint instance_key, float frame, float lifecycle) {
    float offset = u01(stream(uvec3(instance_key, 0u, 0u)));
    float startFrame = -(floor(offset * lifecycle));
    float elapsedFrames = frame - startFrame;
    uint incarnation = uint(floor(elapsedFrames / lifecycle));
    float progress = fract(elapsedFrames / lifecycle);
    float angle = mix(0.,360.,u01(stream(uvec3(instance_key, incarnation, 1u))));
    return ParticleParams(progress, incarnation, angle);
}

out vec2 uv;
void main() {

    uint instance_key = uint(gl_InstanceID);
    ParticleParams ppar = ppar_for(instance_key,  time,  lifecycle);

    float nearCircleDistance = tunnelData.x;
    float nearCircleRadius = tunnelData.y;
    float farCircleDistance = tunnelData.z;
    float farCircleRadius = tunnelData.w;
    mat4 t = translation(vec3(0.0, 0.5, 0.0));
    mat4 r = rotation(vec3(.0, 1.0, 0.0), 15.0);
    mat4 p = perspective_projection(16.0/9.0, 45.0, -nearCircleDistance, -farCircleDistance);
    //gl_Position = p * r * vec4(position, -5.0, 1.0);
    mat4 rayPositions = generateRayPositions(nearCircleDistance, nearCircleRadius, farCircleDistance, farCircleRadius, ppar.angle, ray_length, ppar.progress, ray_thickness);

    //mat4 rayPositions = debugPositions();
    int idx = positionToIndex(position);
    gl_Position = p * rayPositions[idx];
    uv = (position / vec2(2.0, 2.0)) + vec2(0.5);
}