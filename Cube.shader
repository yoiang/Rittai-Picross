// #o3d VertexShaderEntryPoint vertexShaderFunction
// #o3d PixelShaderEntryPoint pixelShaderFunction
// #o3d MatrixLoadOrder RowMajor

float4x4 worldViewProjection : WorldViewProjection;

float3 Numbers;
float3 SpacesHints;

bool DimNumber;

bool FailedBreak;
bool Painted;

bool Solid;
bool Debug;

sampler NumberTexSampler;
sampler SymbolTexSampler;

float4 PaintedColor;
float4 DebugSolidColor;
float4 DebugSpaceColor;

struct VertexShaderInput
{
    float4 position : POSITION;
    float3 normal : NORMAL;
    float2 tex : TEXCOORD0;
};

struct PixelShaderInput
{
    float4 position : POSITION;
    float2 tex : TEXCOORD0;
    float3 normal : TEXCOORD1;
 };

PixelShaderInput vertexShaderFunction(VertexShaderInput input)
{
    PixelShaderInput output;

    output.position = mul(input.position, worldViewProjection);

    output.tex = input.tex;
    output.normal = input.normal;
    return output;
}

float4 pixelShaderFunction(PixelShaderInput input): COLOR
{
    float Number = 10;
    float SpacesHint = 0;

    if ( input.normal.x != 0 )
    {
        Number = Numbers.x;
        SpacesHint = SpacesHints.x;
    } else if ( input.normal.y != 0 )
    {
        Number = Numbers.y;
        SpacesHint = SpacesHints.y;
    } else if ( input.normal.z != 0 )
    {
        Number = Numbers.z;
        SpacesHint = SpacesHints.z;
    }

    float2 NumberTex = float2( input.tex.x / 11.0 + float(Number) / 11.0, input.tex.y );

    float4 Color = tex2D(NumberTexSampler, NumberTex);
    Color.x *= input.normal.x;
    Color.y *= input.normal.y;
    Color.z *= input.normal.z;
    if ( DimNumber )
    {
        Color.x += 0.5;
        Color.y += 0.5;
        Color.z += 0.5;
    }

    if ( SpacesHint == 1 )
    {
        float2 SymbolTex = float2( input.tex.x / 11.0, input.tex.y );
        float4 SymbolColor = tex2D(SymbolTexSampler, SymbolTex );

        if ( SymbolColor.x != 1.0 && SymbolColor.y != 1.0 && SymbolColor.z != 1.0 )
        {
            Color = Color * SymbolColor;
        }
    } else if ( SpacesHint > 1 )
    {
        float2 SymbolTex = float2( input.tex.x / 11.0 + 1.0 / 11.0, input.tex.y );
        float4 SymbolColor = tex2D(SymbolTexSampler, SymbolTex );

        if ( SymbolColor.x != 1.0 && SymbolColor.y != 1.0 && SymbolColor.z != 1.0 )
        {
            Color = Color * SymbolColor;
        }
    }

    if ( FailedBreak )
    {
        float2 SymbolTex = float2( input.tex.x / 11.0 + 2.0 / 11.0, input.tex.y );
        float4 SymbolColor = tex2D(SymbolTexSampler, SymbolTex );

        if ( SymbolColor.x != 1.0 && SymbolColor.y != 1.0 && SymbolColor.z != 1.0 )
        {
        	Color = Color * PaintedColor * SymbolColor;
        } else
        {
	        Color = Color * PaintedColor;
        }
    } else if ( Painted )
    {
        Color = Color * PaintedColor;
    } else if ( Debug )
    {
        float4 colorMult;
        if ( Solid )
        {
            Color = Color * DebugSolidColor;
        } else
        {
            Color = Color * DebugSpaceColor;
        }
    }
    return Color;
}