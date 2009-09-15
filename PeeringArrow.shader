// #o3d VertexShaderEntryPoint vertexShaderFunction
// #o3d PixelShaderEntryPoint pixelShaderFunction
// #o3d MatrixLoadOrder RowMajor

float4x4 worldViewProjection : WorldViewProjection;

bool Grabbed;

float4 NongrabbedColor;
float4 GrabbedColor;

struct VertexShaderInput
{
    float4 position : POSITION;
    float3 normal : NORMAL;
};

struct PixelShaderInput
{
    float4 position : POSITION;
    float3 normal : TEXCOORD1;
 };

PixelShaderInput vertexShaderFunction(VertexShaderInput input)
{
    PixelShaderInput output;

    output.position = mul(input.position, worldViewProjection);

  output.normal = mul(float4(input.normal.xyz, 0.0), worldViewProjection).xyz;
//    output.normal = input.normal;
    return output;
}

float getDiffuse( in float3 Normal )
{
    return saturate(dot(normalize(Normal), normalize(float3( -1, 1, -1)))) * 0.3 + 0.7;
}

float4 pixelShaderFunction(PixelShaderInput input): COLOR
{
    float4 Color;

    if ( Grabbed )
    {
        Color = GrabbedColor;
    } else
    {
        Color = NongrabbedColor;
    }

    float Diffuse = getDiffuse( input.normal );
    Color.x = Color.x * Diffuse;
    Color.y = Color.y * Diffuse;
    Color.z = Color.z * Diffuse;

    return Color;
}