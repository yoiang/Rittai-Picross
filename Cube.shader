// #o3d VertexShaderEntryPoint vertexShaderFunction
// #o3d PixelShaderEntryPoint pixelShaderFunction
// #o3d MatrixLoadOrder RowMajor

float4x4 worldViewProjection : WorldViewProjection;

bool Solid;

float3 Numbers;
float3 DimNumbers;
float3 HideNumbers;
float3 SpacesHints;

bool FailedBreak;
bool Painted;

float4 PaintedColor;

bool Finished;
float4 FinishedColor;

bool Debug;
float4 DebugSolidColor;
float4 DebugSpaceColor;

sampler NumberTexSampler;
sampler SymbolTexSampler;

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

float4 getNumberColor( in float Number, in bool DimNumber, in float2 TexUV )
{
    if ( Number < 0 || Number > 9 )
    {
        return float4( 1, 1, 1, 1 );
    }

    float2 NumberTexUV = float2( TexUV.x / 10.0 + float(Number) / 10.0, TexUV.y );

    float4 Color = tex2D(NumberTexSampler, NumberTexUV);
    if ( Color.x < 1.0 && Color.y < 1.0 && Color.z < 1.0 && DimNumber ) // junk for blocking overdimming, fix this
    {
        return Color + 0.8;
    }
    return Color;
}

float4 getSpacesHintColor( in float SpacesHint, in bool DimNumber, in float2 TexUV )
{
    float SymbolOffset = -1.0;
    if ( SpacesHint == 1 )
    {
        SymbolOffset = 1.0 / 11.0;
    } else if ( SpacesHint > 1 )
    {
        SymbolOffset = 2.0 / 11.0;
    } else
    {
        return float4( 1, 1, 1, 1 );
    }

    float2 SymbolTexUV = float2( TexUV.x / 11.0 + SymbolOffset, TexUV.y );
    if ( DimNumber )
    {
        return tex2D(SymbolTexSampler, SymbolTexUV ) + 0.8;
    }
    return tex2D(SymbolTexSampler, SymbolTexUV );
}

float4 pixelShaderFunction(PixelShaderInput input): COLOR
{
    float4 Color = float4( 1, 1, 1, 1 );
    if ( !Finished )
    {
        float Number = -1;
        float SpacesHint = 0;
        bool HideNumber = false;
        bool DimNumber = false;

        if ( input.normal.x != 0 )
        {
            Number = Numbers.x;
            SpacesHint = SpacesHints.x;
            if ( HideNumbers.x )
            {
                HideNumber = true;
            }
            if ( DimNumbers.x )
            {
                DimNumber = true;
            }
        } else if ( input.normal.y != 0 )
        {
            Number = Numbers.y;
            SpacesHint = SpacesHints.y;
            if ( HideNumbers.y )
            {
                HideNumber = true;
            }
            if ( DimNumbers.y )
            {
                DimNumber = true;
            }
        } else if ( input.normal.z != 0 )
        {
            Number = Numbers.z;
            SpacesHint = SpacesHints.z;
            if ( HideNumbers.z )
            {
                HideNumber = true;
            }
            if ( DimNumbers.z )
            {
                DimNumber = true;
            }
        }

        float2 BorderTex = float2( input.tex.x / 11.0, input.tex.y );
        Color = tex2D(SymbolTexSampler, BorderTex );

        if ( !HideNumber )
        {
            Color = Color * getNumberColor( Number, DimNumber, input.tex );
            if ( Color.x == 1 && Color.y == 1 && Color.z == 1 ) // junk so dimming doesn't over dim, fix this
            {
                Color = Color * getSpacesHintColor( SpacesHint, DimNumber, input.tex );
            }
        }

        if ( Painted || FailedBreak )
        {
            Color = Color * PaintedColor;
        }
    } else
    {
        float Diffuse = 1.0;
        if ( input.normal.x != 0 )
        {
            Diffuse = 1.0;
        } else if ( input.normal.y != 0 )
        {
            Diffuse = 0.9;
        } else if ( input.normal.z != 0 )
        {
            Diffuse = 0.8;
        }

        Color = Color * FinishedColor * Diffuse;
    }

    if ( FailedBreak )
    {
        float2 SymbolTex = float2( input.tex.x / 11.0 + 3.0 / 11.0, input.tex.y );
        float4 SymbolColor = tex2D(SymbolTexSampler, SymbolTex );

        Color = Color * SymbolColor;
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