// #o3d VertexShaderEntryPoint vertexShaderFunction
// #o3d PixelShaderEntryPoint pixelShaderFunction
// #o3d MatrixLoadOrder RowMajor

float4x4 worldViewProjection : WorldViewProjection;

float3 Numbers;
float3 HideNumbers;
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

float4 getNumberColor( in float Number, in float2 TexUV )
{
    float2 NumberTexUV = float2( TexUV.x / 11.0 + float(Number) / 11.0, TexUV.y );

    float4 Color = tex2D(NumberTexSampler, NumberTexUV);
    if ( DimNumber )
    {
        Color.x += 0.5;
        Color.y += 0.5;
        Color.z += 0.5;
    }
    return Color;
}

float4 getSpacesHintColor( in float SpacesHint, in float2 TexUV )
{
    float SymbolOffset = -1.0;
    if ( SpacesHint == 1 )
    {
        SymbolOffset = 0.0;
    } else if ( SpacesHint > 1 )
    {
        SymbolOffset = 1.0 / 11.0;
    } else
    {
        return float4( 1, 1, 1, 1 );
    }

    float2 SymbolTexUV = float2( TexUV.x / 11.0 + SymbolOffset, TexUV.y );
    return tex2D(SymbolTexSampler, SymbolTexUV );
}

float4 pixelShaderFunction(PixelShaderInput input): COLOR
{
    float Number = 10;
    float SpacesHint = 0;
    bool HideNumber = false;

    if ( input.normal.x != 0 )
    {
        Number = Numbers.x;
        SpacesHint = SpacesHints.x;
        if ( HideNumbers.x )
        {
            HideNumber = true;
        }
    } else if ( input.normal.y != 0 )
    {
        Number = Numbers.y;
        SpacesHint = SpacesHints.y;
        if ( HideNumbers.y )
        {
            HideNumber = true;
        }
    } else if ( input.normal.z != 0 )
    {
        Number = Numbers.z;
        SpacesHint = SpacesHints.z;
        if ( HideNumbers.z )
        {
            HideNumber = true;
        }
    }

    float2 BorderTex = float2( input.tex.x / 11.0 + 10.0 / 11.0, input.tex.y );
    float4 Color = tex2D(SymbolTexSampler, BorderTex );

    if ( !HideNumber )
    {
        Color = Color * getNumberColor( Number, input.tex );
        Color = Color * getSpacesHintColor( SpacesHint, input.tex );
    }

    if ( FailedBreak )
    {
        float2 SymbolTex = float2( input.tex.x / 11.0 + 2.0 / 11.0, input.tex.y );
        float4 SymbolColor = tex2D(SymbolTexSampler, SymbolTex );

        Color = Color * PaintedColor * SymbolColor;
    } else if ( Painted )
    {
        Color = Color * PaintedColor;
    }

    if ( Debug )
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