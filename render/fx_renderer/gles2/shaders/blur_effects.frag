#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 v_texcoord;

uniform sampler2D tex;

uniform float noise;
uniform float brightness;
uniform float contrast;
uniform float saturation;

mat4 brightnessMatrix() {
	float b = brightness - 1.0;
	return mat4(1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				b, b, b, 1);
}

mat4 contrastMatrix() {
	float t = (1.0 - contrast) / 2.0;
	return mat4(contrast, 0, 0, 0,
				0, contrast, 0, 0,
				0, 0, contrast, 0,
				t, t, t, 1);
}

mat4 saturationMatrix() {
	vec3 luminance = vec3(0.3086, 0.6094, 0.0820);
	float oneMinusSat = 1.0 - saturation;
	vec3 red = vec3(luminance.x * oneMinusSat);
	red+= vec3(saturation, 0, 0);
	vec3 green = vec3(luminance.y * oneMinusSat);
	green += vec3(0, saturation, 0);
	vec3 blue = vec3(luminance.z * oneMinusSat);
	blue += vec3(0, 0, saturation);
	return mat4(red, 0,
				green, 0,
				blue, 0,
				0, 0, 0, 1);
}

// Fast generative noise function
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 1689.1984);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {
	vec4 color = texture2D(tex, v_texcoord);
	color *= brightnessMatrix() * contrastMatrix() * saturationMatrix();
	float noiseHash = hash(v_texcoord);
	float noiseAmount = (mod(noiseHash, 1.0) - 0.5);
	color.rgb += noiseAmount * noise;

	gl_FragColor = color;
}
