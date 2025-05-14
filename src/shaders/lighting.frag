#version 300 es

uniform sampler2D tAlbedo;
uniform sampler2D tNormal;
uniform sampler2D tPosition;
uniform sampler2D tMetallicRoughness;

uniform int debugMode;

layout(location = 0) out vec4 outColor;


void main() {
    switch (debugMode) {
        case 0:
            outColor = texture(tAlbedo, gl_FragCoord.xy);
            break;
        case 1:
            outColor = texture(tNormal, gl_FragCoord.xy);
            break;
        case 2:
            outColor = texture(tPosition, gl_FragCoord.xy);
            break;
        case 3:
            outColor = texture(tMetallicRoughness, gl_FragCoord.xy);
            break;
        default:
            outColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
