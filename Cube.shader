// #o3d VertexShaderEntryPoint vertexShaderFunction
// #o3d PixelShaderEntryPoint pixelShaderFunction
// #o3d MatrixLoadOrder RowMajor

float4x4 worldViewProjection : WorldViewProjection;

bool Solid;

bool IgnoreColorModifiers;
bool EditMode;

bool PeerThrough;

float Number;
bool DimNumber;
bool HideNumber;
float SpacesHint;

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

float4 getFinishedColor( in float3 Normal )
{
    float Diffuse = 1.0;
    if ( Normal.x != 0 )
    {
        Diffuse = 1.0;
    } else if ( Normal.y != 0 )
    {
        Diffuse = 0.9;
    } else if ( Normal.z != 0 )
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
        return float4( 0.8, 0, 0.8, 1 );
    } else
    {
        return float4( 1.0, 1.0, 1.0, 1.0 );
    }
}

PixelShaderInput vertexShaderFunction(VertexShaderInput input)
{
    PixelShaderInput output;

    output.position = mul(input.position, worldViewProjection);

    output.tex = input.tex;
    output.normal = input.normal;

    output.color = float4( 1, 1, 1, 1);
    if ( !PeerThrough )
    {
        if ( Debug )
        {
            output.color = output.color * getDebugColor();
        }
        if ( ShowGuaranteed )
        {
            output.color = output.color * getGuaranteedColor();
        }
        if ( !IgnoreColorModifiers && ( Finished || EditMode ) )
        {
            output.color = output.color * getFinishedColor( input.normal );
        }
    }

    return output;
}

float4 getNumberColor( in float2 TexUV )
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

float4 getSpacesHintColor( in float2 TexUV )
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

float4 pixelShaderFunction(PixelShaderInput input): COLOR
{
    if ( !IgnoreColorModifiers && ( !Finished || EditMode ) || IgnoreColorModifiers )
    {
        input.color = input.color * getBorderColor( input.tex );
    }

    if ( PeerThrough )
    {
        if ( input.color.x == 1 && input.color.y == 1 && input.color.z == 1 )
        {
            return float4( 0, 0, 0, 0 );
        } else
        {
            input.color.a = 0.2;
        }
        return input.color;
    }

    if ( !IgnoreColorModifiers )
    {
        if ( !Finished && !EditMode )
        {
            if ( !HideNumber )
            {
                input.color = input.color * getNumberColor( input.tex );
                input.color = input.color * getSpacesHintColor( input.tex );
            }

            if ( Painted || FailedBreak )
            {
                input.color = input.color * PaintedColor;
            }
        }
    }

    if ( FailedBreak )
    {
        input.color = input.color * getFailedBreakColor( input.tex );
    }

    return input.color;
}
