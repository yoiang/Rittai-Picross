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
float4 DebugSolidColor;
float4 DebugSpaceColor;

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
    float4 data : TEXCOORD1;
 };

float4 getFinishedColor( in int Dimension )
{
    float Diffuse = 1.0;
    if ( Dimension == 0 )
    {
        Diffuse = 1.0;
    } else if ( Dimension == 1 )
    {
        Diffuse = 0.9;
    } else if ( Dimension == 2 )
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
        return DebugSolidColor;
    } else
    {
        return DebugSpaceColor;
    }
}

PixelShaderInput vertexShaderFunction(VertexShaderInput input)
{
    PixelShaderInput output;

    output.position = mul(input.position, worldViewProjection);

    output.tex = input.tex;

    int Dimension;
    if ( input.normal.x != 0 )
    {
        Dimension = 0;
    } else if ( input.normal.y != 0 )
    {
        Dimension = 1;
    } else
    {
        Dimension = 2;
    }

    output.data = float4( 1, 1, 1, 1);
    if ( Debug )
    {
        output.data = output.data * getDebugColor();
    }
    if ( ShowGuaranteed && Guaranteed )
    {
        output.data = output.data * float4( 0.8, 0, 0.8, 1 );
    }
    if ( !IgnoreColorModifiers && ( Finished || EditMode ) )
    {
        output.data = output.data * getFinishedColor( Dimension );
    }

    output.data.a = Dimension;

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
    if ( Color.x < 1.0 && Color.y < 1.0 && Color.z < 1.0 && DimNumber ) // junk for blocking overdimming, fix this
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
    if ( DimNumber )
    {
        return tex2D(SymbolTexSampler, SymbolTexUV ) + 0.8;
    }
    return tex2D(SymbolTexSampler, SymbolTexUV );
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
    float4 Color = float4( input.data.xyz, 1.0 );
    if ( !IgnoreColorModifiers && ( !Finished || EditMode ) || IgnoreColorModifiers )
    {
        Color = Color * getBorderColor( input.tex );
    }

    if ( PeerThrough )
    {
        if ( Color.x == 1 && Color.y == 1 && Color.z == 1 )
        {
            Color.a = 0.0;
        } else
        {
            Color.a = 0.2;
        }
        return Color;
    }

    if ( !IgnoreColorModifiers )
    {
        if ( !Finished && !EditMode )
        {
            if ( !HideNumber )
            {
                Color = Color * getNumberColor( input.tex );
                if ( Color.x == 1 && Color.y == 1 && Color.z == 1 ) // junk so dimming doesn't over dim, fix this
                {
                    Color = Color * getSpacesHintColor( input.tex );
                }
            }

            if ( Painted || FailedBreak )
            {
                Color = Color * PaintedColor;
            }
        }
    }

    if ( FailedBreak )
    {
        Color = Color * getFailedBreakColor( input.tex );
    }

    return Color;
}