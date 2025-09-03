in vec2 uv;
in float texture_sample_factor;
in float progress_factor;

void main() {

    float color_variance_factor = colorVarianceFactor;
    float final_color_factor = progress_factor + color_variance_factor * (texture_sample_factor - color_variance_factor / 2.);
    final_color_factor = clamp(final_color_factor, 0.0, 1.0);

    vec4 color = texture(colorTex, vec2(final_color_factor, 0.0));


    // gaussian function for y
    float sigma = 0.1;
    float gaussian = exp(-pow(uv.x - 0.5, 2.0) / (2.0 * pow(sigma, 2.0)));
    float sigma2 = 0.2;
    float gaussian2 = exp(-pow(uv.y - 0.5, 2.0) / (2.0 * pow(sigma2, 2.0)));
    float intensity = gaussian * gaussian2;
    outColor = vec4(color.rgb * intensity, 1.0);
}