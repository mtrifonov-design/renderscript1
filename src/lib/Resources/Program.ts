import type { ResourceClass } from ".";
import { PersistentResource } from "./BaseResources";
import type { GlobalSignatureData, InstanceSignatureData, ProgramData, VertexSignatureData } from "./types";
import ProgramProvider from "../WebGLHelperLib/ProgramProvider";

export class Program extends PersistentResource {
    type = "Program";
    declare data: ProgramData;
    programProvider: ProgramProvider;
    constructor(resources: Map<string, ResourceClass>, id: string, data: ProgramData, gl: WebGL2RenderingContext) {
        super(resources, id, data, gl);
        this.programProvider = new ProgramProvider(gl, {
            vertexShader: data.vertexShader,
            fragmentShader: data.fragmentShader,
            uniformProviderSignature: (() => {
                if (data.globalSignature) {
                    const sig = this.resources.get(data.globalSignature) as undefined | GlobalSignatureData;
                    if (!sig) throw new Error(`Global signature ${data.globalSignature} not found for program ${id}`);
                    const uniformStructure = [];
                    for (const [name, type] of Object.entries(sig)) {
                        uniformStructure.push({ name, type });
                    }
                    return { uniformProviderName: data.globalSignature, uniformStructure };
                } else return undefined;
            })(),
            vertexProviderSignature: (() => {
                const sig = this.resources.get(data.vertexSignature) as undefined | VertexSignatureData;
                if (!sig) throw new Error(`Vertex signature ${data.vertexSignature} not found for program ${id}`);
                const vertexStructure = [];
                for (const [name, type] of Object.entries(sig.attributes)) {
                    vertexStructure.push({ name, type });
                }
                return {
                    vertexProviderName: data.vertexSignature, vertexStructure,
                    maxTriangleCount: sig.maxTriangleCount,
                    maxVertexCount: sig.maxVertexCount
                };
            })(),
            instanceProviderSignature: (() => {
                if (data.instanceSignature) {
                    const sig = this.resources.get(data.instanceSignature) as undefined | InstanceSignatureData;
                    if (!sig) throw new Error(`Instance signature ${data.instanceSignature} not found for program ${id}`);
                    const instanceStructure = [];
                    for (const [name, type] of Object.entries(sig.attributes)) {
                        instanceStructure.push({ name, type });
                    }
                    return {
                        instanceProviderName: data.instanceSignature, instanceStructure,
                        maxInstanceCount: sig.maxInstanceCount
                    };
                } else return undefined;
            })()
        });
    }
}