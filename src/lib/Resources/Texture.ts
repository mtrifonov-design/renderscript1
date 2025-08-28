import { VariableResource } from "./BaseResources";

export class StaticTexture extends VariableResource {
    type = "StaticTexture";
    computeDependencies() { "do nothing" };
};

export class DynamicTexture extends VariableResource {
    type = "DynamicTexture";
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
};