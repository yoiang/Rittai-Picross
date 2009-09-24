// #o3d VertexShaderEntryPoint vertexShaderFunction
// #o3d PixelShaderEntryPoint pixelShaderFunction
// #o3d MatrixLoadOrder RowMajor

float4x4 worldViewProjection : WorldViewProjection;

bool Solid;

bool IgnoreColorModifiers;
bool EditMode;

bool PeerThrough;

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

bool ShowGuaranteed;
bool Guaranteed;

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
    float4 color : COLOR;
 };

float4 getDebugColor()
{
    if ( Solid )
    {
        return float4( 0.8, 1.0, 0.8, 1.0 );
    } else
    {
        return float4( 1.0, 0.8, 0.8, 1.0 );
    }
}

float4 getGuaranteedColor()
{
    if ( Guaranteed )
    {
        return float4( 0.8, 0, 0.8, 1.0 );
    } else
    {
        return float4( 1, 1, 1, 1 );
    }
}

PixelShaderInput vertexShaderFunction(VertexShaderInput input)
{
    PixelShaderInput output;

    output.position = mul(input.position, worldViewProjection);

    output.tex = input.tex;
    output.normal = input.normal;

    float4 Color = float4( 1, 1, 1, 1 );

    if ( !PeerThrough )
    {
        if ( Debug )
        {
            Color = Color * getDebugColor();
        }

        if ( ShowGuaranteed )
        {
            Color = Color * getGuaranteedColor();
        }
    }
    output.color = Color;

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
    if ( DimNumber && Color.x < 1.0 && Color.y < 1.0 && Color.z < 1.0 ) // junk for blocking overdimming, fix this
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
    float4 Color = tex2D(SymbolTexSampler, SymbolTexUV );
    if ( DimNumber && Color.x < 1.0 && Color.y < 1.0 && Color.z < 1.0 ) // junk for blocking overdimming, fix this
    {
        return Color + 0.8;
    }
    return Color;
}

float4 getBorderColor( in float2 TexUV )
{
    float2 BorderTex = float2( TexUV.x / 11.0, TexUV.y );
    return tex2D(SymbolTexSampler, BorderTex );
}

float4 getFailedBreakColor( in float2 TexUV )
{
    float2 BorderTex = float2( TexUV.x / 11.0 + 3.0 / 11.0, TexUV.y );
    return tex2D(SymbolTexSampler, BorderTex );
}

float4 getFinishedColor( in float3 Normal )
{
    float Diffuse = 1.0;
    if ( Normal.x != 0 )
    {
        Diffuse = 1.0;
    } else if ( Normal.y != 0 )
    {
        Diffuse = 0.9;
    } else
    {
        Diffuse = 0.8;
    }

    float4 Color;
    Color.x = FinishedColor.x * Diffuse;
    Color.y = FinishedColor.y * Diffuse;
    Color.z = FinishedColor.z * Diffuse;
    Color.a = FinishedColor.a;
    return Color;
}

float4 pixelShaderFunction(PixelShaderInput input): COLOR
{
    float4 BorderColor;
    if ( !IgnoreColorModifiers && ( !Finished || EditMode ) || IgnoreColorModifiers )
    {
        BorderColor = getBorderColor( input.tex );
    } else
    {
        BorderColor = float4( 1.0, 1.0, 1.0, 1.0 );
    }

    if ( PeerThrough )
    {
        if ( BorderColor.x == 1 && BorderColor.y == 1 && BorderColor.z == 1 )
        {
            BorderColor.a = 0.0;
        } else
        {
            BorderColor.a = 0.2;
        }
        return BorderColor;
    }
    input.color = input.color * BorderColor;

    if ( !IgnoreColorModifiers )
    {
        if ( !Finished && !EditMode )
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
            } else
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

            if ( !HideNumber )
            {
                input.color = input.color * getNumberColor( Number, DimNumber, input.tex );
                input.color = input.color * getSpacesHintColor( SpacesHint, DimNumber, input.tex );
            }

            if ( Painted || FailedBreak )
            {
                input.color = input.color * PaintedColor;
            }
        } else
        {
            input.color = input.color * getFinishedColor( input.normal );
        }
    }

    if ( FailedBreak )
    {
        input.color = input.color * getFailedBreakColor( input.tex );
    }

    return input.color;
}