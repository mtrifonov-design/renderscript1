in vec2 uv;
void main() {
    // gaussian function for y
    float sigma = 0.1;
    float gaussian = exp(-pow(uv.x - 0.5, 2.0) / (2.0 * pow(sigma, 2.0)));
    float sigma2 = 0.2;
    float gaussian2 = exp(-pow(uv.y - 0.5, 2.0) / (2.0 * pow(sigma2, 2.0)));
    outColor = vec4(gaussian *  gaussian2,0., 0.0, 1.0);
}