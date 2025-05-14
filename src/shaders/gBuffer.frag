#version 300 es

layout(location = 0) in vec3 inPos;
layout(location = 1) in vec3 inNormal;

layout(layout=0) out vec4 outAlbedo;
layout(layout=1) out vec4 outNormal;
layout(layout=2) out vec4 outPosition;
layout(layout=3) out vec4 outMetallicRoughness;


void main() {
    outAlbedo = vec4(1.0, 0.0, 0.0, 1.0);
    outNormal = vec4(inNormal, 1.0);
    outPosition = vec4(inPos, 1.0);
    outMetallicRoughness = vec4(0.5, 0.5, 0.5, 1.0);
}