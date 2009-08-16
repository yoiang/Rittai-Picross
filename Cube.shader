float4x4 worldViewProjection : WorldViewProjection;

int Number;
int NonadjacentSpaces;

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
    float2 tex : TEXCOORD0;
};

struct PixelShaderInput
{
    float4 position : POSITION;
    float2 tex : TEXCOORD0;
};

PixelShaderInput vertexShaderFunction(VertexShaderInput input)
{
    PixelShaderInput output;

    output.position = mul(input.position, worldViewProjection);

    output.tex = input.tex;
    return output;
}

float4 pixelShaderFunction(PixelShaderInput input): COLOR
{
    float2 NumberTex = float2( input.tex.x / 11.0 + float(Number) / 11.0, input.tex.y );
    float4 Color = tex2D(NumberTexSampler, NumberTex);

    if ( NonadjacentSpaces == 1 )
    {
        float2 SymbolTex = float2( input.tex.x / 11.0, input.tex.y );
        float4 SymbolColor = tex2D(SymbolTexSampler, SymbolTex );

        if ( SymbolColor.x != 1.0 && SymbolColor.y != 1.0 && SymbolColor.z != 1.0 )
        {
            Color = Color * SymbolColor;
        }
    } else if ( NonadjacentSpaces > 1 )
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

// #o3d VertexShaderEntryPoint vertexShaderFunction
// #o3d PixelShaderEntryPoint pixelShaderFunction
// #o3d MatrixLoadOrder RowMajor