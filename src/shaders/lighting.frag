#define MAX_POINT_LIGHTS 10
#define PI 3.141592653589793
uniform sampler2D tAlbedo;
uniform sampler2D tNormal;
uniform sampler2D tPosition;
uniform sampler2D tMetallicRoughness;
uniform vec3 pointLightPosition[MAX_POINT_LIGHTS];
uniform vec3 pointLightColor[MAX_POINT_LIGHTS];
uniform float pointLightIntensity[MAX_POINT_LIGHTS];
uniform int debugMode;

in vec2 vUv;
layout(location = 0) out vec4 outColor;
float DistributionGGX(vec3 N,vec3 H, float roughness)
{
	float a = roughness * roughness;
	float a2 = a * a;
	float NOH = clamp(dot(N,H),0.0,1.0);
	float NOH2 = NOH*NOH;
	float nom = a2;
	float demom = (NOH2 * (a2-1.0) + 1.0);
	demom = PI * demom * demom;
	return nom/demom;
}
float GeometrySchlickGGX(float NoV, float roughness)
{
	float r = roughness + 1.0;
	float k = r*r / 8.0f;
	float nom = NoV;
	float denom = NoV * (1.0 - k) + k;
	return nom/denom;
}
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
	float NoV = clamp(dot(N,V),0.0,1.0);
	float NoL = clamp(dot(N,L),0.0,1.0);
	float ggx2 = GeometrySchlickGGX(NoV,roughness);
	float ggx1 = GeometrySchlickGGX(NoL,roughness);
	return ggx1* ggx2;
}
vec3 FresnelSchlick(float HoV, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0-HoV,0.0,1.0), 5.0);
}

void main() {
    vec4 albedo = texture(tAlbedo, vUv);
    vec4 normal = texture(tNormal, vUv);
    vec4 position = texture(tPosition, vUv);
    vec4 metallicRoughness = texture(tMetallicRoughness, vUv);
    vec4 finalColor = vec4(0.0, 0.0, 0.0, 1.0);

    vec3 V = cameraPosition - position.xyz;
    vec3 N = normal.xyz;
    for(int i = 0; i < MAX_POINT_LIGHTS; i++) {
        vec3 L = pointLightPosition[i] - position.xyz;
        vec3 H = normalize(V + L);
        float distance = length(L);
        L = normalize(L);
        float attenuation = 1.0 / (distance * distance);
        float NoL = max(dot(N, L), 0.0);
        float NoV = max(dot(N, V), 0.0);
        float NoH = max(dot(N, H), 0.0);
        vec3 F0 = mix(vec3(0.04), albedo.rgb, metallicRoughness.r);
        vec3 F = FresnelSchlick(NoH, F0);
        float D = DistributionGGX(N, H, metallicRoughness.g);
        float G = GeometrySmith(N, V, L, metallicRoughness.g);
        vec3 numerator = D * G * F;
        float denominator = 4.0 * NoL * NoV + 0.001;
        vec3 specular = numerator / denominator;

        vec3 diffuse =  (vec3(1.0) - F) * albedo.rgb / PI;
        vec3 color = (diffuse + specular) * NoL * pointLightColor[i] * pointLightIntensity[i] * attenuation;
        finalColor += vec4(color, 1.0);
    }
    switch (debugMode) {
        case 0:
            outColor = finalColor;
            break;
        case 1:
            outColor = albedo;
            break;
        case 2:
            outColor = normal;
            break;
        case 3:
            outColor = position;
            break;
        case 4: 
            outColor = metallicRoughness;
            break;
        default:
            outColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
}
