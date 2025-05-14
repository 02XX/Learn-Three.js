

in vec3 vPosition;
in vec3 vNormal;

layout(location = 0) out vec4 outAlbedo;            // RGB: 漫反射颜色, A: 透明度
layout(location = 1) out vec4 outNormal;            // RGB: 法线, A: 未使用
layout(location = 2) out vec4 outPosition;          // RGB: 世界/视图空间位置, A: 未使用
layout(location = 3) out vec4 outMetallicRoughness; // R: 金属度, G: 粗糙度, BA: 未使用


void main() {
    outAlbedo = vec4(1.0, 0.0, 0.0, 1.0);
    outNormal = vec4(vNormal, 1.0);
    outPosition = vec4(vPosition, 1.0);
    outMetallicRoughness = vec4(0.5, 0.5, 0.5, 1.0);
}