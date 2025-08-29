import type { Instance, Program, ResourceClass, Vertex, VertexSignature } from ".";
import TextureProvider from "../WebGLHelperLib/TextureProvider";
import { VariableResource } from "./BaseResources";
import SetupInstances from "./RenderPass/SetupInstances";
import SetupTextures from "./RenderPass/SetupTextures";
import SetupUniforms from "./RenderPass/SetupUniforms";
import SetupVertices from "./RenderPass/SetupVertices";
import type { DrawOperation, DynamicTextureData, StaticTextureData, TextureSignatureData } from "./types";

export class StaticTexture extends VariableResource {
    type = "StaticTexture";
    declare data : StaticTextureData;
    computeDependencies() { "do nothing" };
    textureProvider : TextureProvider;
    constructor(resources: Map<string, ResourceClass>,
        id: string,
        data: StaticTextureData,
        gl: WebGL2RenderingContext
    ) {
        super(resources,id,data,gl);
        const res = this.resources.get(this.data.signature) as undefined | ResourceClass;
        if (!res) throw new Error("Missing signature data");
        const sig = res.data as TextureSignatureData;
        this.textureProvider = new TextureProvider(gl, {
            shape: sig.size,
            type: sig.type,
            createFramebuffer: false,
        })
    }

    setTextureData(textureData: HTMLImageElement | Float32Array | Uint8Array) {
        this.textureProvider.setData(textureData);
        this.markAndPropagateDirty();
        this.dirty = false;
    }
};

export class DynamicTexture extends VariableResource {
    type = "DynamicTexture";
    declare data : DynamicTextureData;
    computeDependencies() {
        // compute dependsOn
        const drawOps = this.data.drawOps;
        const dependsOn = [];
        for (const drawOp of drawOps) {
            dependsOn.push(...Object.keys(drawOp.textures));
        }

        // compute isDependencyOf
        const dynamicTextures = Array.from(this.resources.values()).filter(r => r.type === "DynamicTexture");
        for (const texture of dynamicTextures) {
            let isDependencyOf = false;
            const textureDrawOps = texture.data.drawOps;
            for (const drawOp of textureDrawOps) {
                if (this.id in Object.keys(drawOp.textures)) {
                    isDependencyOf = true;
                    break;
                }
            }
            if (isDependencyOf) {
                this.isDependencyOf.push(texture.id);
            }
        }
    };
    textureProvider: TextureProvider;
    constructor(resources: Map<string, ResourceClass>,
        id: string,
        data: StaticTextureData,
        gl: WebGL2RenderingContext
    ) {
        super(resources,id,data,gl);
        const res = this.resources.get(this.data.signature) as undefined | ResourceClass;
        if (!res) throw new Error("Missing signature data");
        const sig = res.data as TextureSignatureData;
        this.textureProvider = new TextureProvider(gl, {
            shape: sig.size,
            type: sig.type,
            createFramebuffer: true,
        })
    }
    updateTextureData() {
        if (!this.dirty) return;
        for (const dep of this.dependsOn) {
            const res = this.resources.get(dep) as undefined | ResourceClass;
            if (res && res.type === "DynamicTexture" && "dirty" in res && res.dirty) {
                (res as DynamicTexture).updateTextureData();
            }
        }
        this.performRenderPass();
        this.dirty = false;
    }

    performRenderPass() {
        // Set up the texture we're drawing into.
        const res = this.resources.get(this.data.signature) as undefined | ResourceClass;
        if (!res) throw new Error("Missing signature data");
        const sig = res.data as TextureSignatureData;
        this.gl.viewport(0, 0, sig.size[0], sig.size[1]);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.textureProvider.framebuffer);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for (const drawOp of this.data.drawOps) {
            this.performDrawOp(drawOp);
        }
    }

    performDrawOp(drawOp : DrawOperation) {
        // set up vertices
        SetupVertices(this.gl, this.resources, drawOp.vertex);
        // get vertex attribute length
        const vertex = this.resources.get(drawOp.vertex) as undefined | Vertex;
        if (!vertex) throw new Error("Something went wrong.");
        const signatureId = vertex.data.signature;
        const vertexSignature = this.resources.get(signatureId) as undefined | VertexSignature;
        if (!vertexSignature) throw new Error("Something went wrong.");
        const vertexAttributeLength = Object.keys(vertexSignature.data.attributes).length;

        // set up instances (if applicable)
        if (drawOp.instance) {
            SetupInstances(this.gl, this.resources, drawOp.instance, vertexAttributeLength);
        }

        const program = this.resources.get(drawOp.program) as undefined | Program;
        if (!program) throw new Error("Something went wrong.");
        this.gl.useProgram(program.programProvider.program!);

        if (drawOp.global) {
            SetupUniforms(this.gl, this.resources, drawOp.global, program.programProvider.program!);
        }
        // set up textures
        SetupTextures(this.gl, this.resources, drawOp.textures, program.programProvider.program!);
        // perform draw call

        const instanced = drawOp.instance !== undefined;
        if (instanced) {
            const instance = this.resources.get(drawOp.instance!) as undefined | Instance;
            if (!instance) throw new Error("Something went wrong.");
            this.gl.drawElementsInstanced(
                this.gl.TRIANGLES,
                vertex.triangleCount * 3,
                this.gl.UNSIGNED_SHORT,
                0,
                instance.instanceCount
            );
        } else {
            this.gl.drawElements(
                this.gl.TRIANGLES,
                vertex.triangleCount * 3,
                this.gl.UNSIGNED_SHORT,
                0
            );
        }

    }


};