

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;
uniform sampler2D uAlbedo;
uniform sampler2D uNormal;
uniform sampler2D uArm;
uniform vec3 albedo;
uniform float normal;
uniform float metallic;
uniform float roughness;


layout(location = 0) out vec4 outAlbedo;            // RGB: 漫反射颜色, A: 透明度
layout(location = 1) out vec4 outNormal;            // RGB: 法线, A: 未使用
layout(location = 2) out vec4 outPosition;          // RGB: 世界/视图空间位置, A: 未使用
layout(location = 3) out vec4 outArm; // RGB: 




void main() {
    outAlbedo = texture(uAlbedo, vUV) * vec4(albedo, 1.0);
    outNormal = vec4(vNormal,1.0) * normal;
    outPosition = vec4(vPosition, 1.0);
    vec4 arm = texture(uArm, vUV);
    outArm = vec4(arm.r, arm.g*roughness, arm.b*metallic, 1.0);
}