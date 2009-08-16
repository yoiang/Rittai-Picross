float4x4 worldViewProjection : WorldViewProjection;

int Number;
int NonadjacentSpaces;

bool FailedBreak;
bool Painted;

bool Solid;
bool Debug;

sampler NumberTexSampler;
sampler SymbolTexSampler;

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
    if ( NonadjacentSpaces == 1 )
    {
        float2 SymbolTex = float2( input.tex.x / 11.0, input.tex.y );
        float4 SymbolColor = tex2D(SymbolTexSampler, SymbolTex );

        if ( SymbolColor.x < 0.2 && SymbolColor.y < 0.2 && SymbolColor.z < 0.2 )
        {
            return SymbolColor;
        }
    } else if ( NonadjacentSpaces > 1 )
    {
        float2 SymbolTex = float2( input.tex.x / 11.0 + 1.0 / 11.0, input.tex.y );
        float4 SymbolColor = tex2D(SymbolTexSampler, SymbolTex );

        if ( SymbolColor.x < 0.2 && SymbolColor.y < 0.2 && SymbolColor.z < 0.2 )
        {
            return SymbolColor;
        }
    }

    float2 NumberTex = float2( input.tex.x / 11.0 + float(Number) / 11.0, input.tex.y );

    if ( FailedBreak )
    {
        int x = NumberTex * 10.0;
        int y = NumberTex * 10.0;
        if ( x * y % 5 == 0 )
        {
            return float4(0,0,0,1);
        }
        float4 colorMult;
        colorMult = float4(0, 0, 1, 1);
        return tex2D(NumberTexSampler, NumberTex) * colorMult;
    } else if ( Painted )
    {
        float4 colorMult;
        colorMult = float4(0, 0, 1, 1);
        return tex2D(NumberTexSampler, NumberTex) * colorMult;
    } else if ( Debug )
    {
        float4 colorMult;
        if ( Solid )
        {
            colorMult = float4(0.8, 1, 0.8, 1);
        } else
        {
            colorMult = float4(1, 0.8, 0.8, 1);
        }
        return tex2D(NumberTexSampler, NumberTex) * colorMult;
    } else
    {
        return tex2D(NumberTexSampler, NumberTex);
    }
}

// #o3d VertexShaderEntryPoint vertexShaderFunction
// #o3d PixelShaderEntryPoint pixelShaderFunction
// #o3d MatrixLoadOrder RowMajor