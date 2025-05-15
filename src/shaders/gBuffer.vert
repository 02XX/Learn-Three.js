

out vec3 vPosition;
out vec3 vNormal;
out vec2 vUV;

void main()
{
    //视图空间
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * vec4(vPosition, 1.0);
    vUV = uv;
}