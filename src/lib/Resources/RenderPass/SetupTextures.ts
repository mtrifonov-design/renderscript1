import type { DynamicTexture, ResourceClass, StaticTexture } from "..";

export default function SetupTextures(
    gl: WebGL2RenderingContext,
    resources: Map<string, ResourceClass>,
    textures: { [key: string]: string },
    program: WebGLProgram) {

        let slot = 0;
        for (const [textureName, textureId] of Object.entries(textures)) {
            SetupTexture(gl, resources, textureName, textureId, program, slot);
            slot++;
        }

};


function SetupTexture(
    gl: WebGL2RenderingContext,
    resources: Map<string, ResourceClass>,
    textureName: string,
    textureId: string,
    program: WebGLProgram,
    slot: number
) {
    const texture = resources.get(textureId) as undefined | DynamicTexture | StaticTexture; 
    if (!texture) throw new Error("Something went wrong.");
    if (texture.type !== "StaticTexture" && texture.type !== "DynamicTexture") throw new Error("Something went wrong.");

    const location = gl.getUniformLocation(program, textureName);
    if (location === null) throw new Error("Something went wrong.");
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, texture.textureProvider.texture);
    gl.uniform1i(location, slot);

}