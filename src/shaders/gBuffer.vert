#version 300 es


layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec3 inNormal;
layout(location = 2) in vec2 inTexCoords;


layout(location = 0) out vec3 outPosition;
layout(location = 1) out vec3 outNormal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

void main()
{
    //视图空间
    outPosition = (modelViewMatrix * vec4(inPosition, 1.0)).xyz;
    outNormal = normalize(normalMatrix * vec4(inNormal, 0.0)).xyz;
    gl_Position = projectionMatrix * vec4(outPosition, 1.0);
}