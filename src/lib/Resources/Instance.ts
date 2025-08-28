import { VariableResource } from "./BaseResources";

export class Instance extends VariableResource {
    type = "Instance";
    computeDependencies() {
        const resourceArray = Array.from(this.resources.values());
        const dynamicTextures = resourceArray.filter(r => r.type === "DynamicTexture");
        for (const texture of dynamicTextures) {
            let isDependencyOf = false;
            const drawOps = texture.data.drawOps;
            for (const drawOp of drawOps) {
                if (drawOp.instance && drawOp.instance === this.id) {
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