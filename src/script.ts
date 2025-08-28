const script = `
vsig : VertexSignature {
  "attributes": { "position": "vec2" },
  "maxCount": 1024,
  "maxTriangleCount": 2048,
}
---
isig : InstanceSignature {
  "attributes": {
    "col": "vec4",
    "instancePosition": "vec2",
    "radius": "float"
  },
  "maxInstanceCount": 64
}
---
gsig : GlobalSignature {
    "screenSize": "vec2"
}
---
tsig : TextureSignature {
  "type": "RGBA8",
  "size": [1920, 1080]
}
---
v    : Vertex { "signature": "vsig" };
---
i    : Instance { "signature": "isig" };
---
g    : Global { "signature": "gsig" };
---
t_bg : Texture { "signature": "tsig" };
// later: t: TextureSlot;
---
p_bg : Program {
  "vertexSignature": "vsig",
  globalSignature: "gsig",
  "vertexShader": "\
     out vec2 v_uv;\
     void main(){\
       v_uv = 0.5 * (position + 1.0);\
       gl_Position = vec4(position, 0.0, 1.0);\
    }",
  "fragmentShader": "\
      in vec2 v_uv;\
  void main(){ fragColor = texture(backgroundTexture, v_uv); }",
  "textures": { "backgroundTexture": {
    filter: "linear",
    wrap: "clamp"
  } }
};
---
p_circles : Program {
  vertexSignature: "vsig",
  instanceSignature: "isig",
  globalSignature: "gsig",
  vertexShader: "out vec2 v_local;\
    out vec4 v_col;\
    void main(){\
      vec2 r_ndc = (2.0 * vec2(radius) / screenSize);\
      vec2 pos_ndc = (2.0 * instancePosition / screenSize) - 1.0;\
      vec2 p = pos_ndc + position * r_ndc;\
      v_local = position; \
      v_col = col;\
      gl_Position = vec4(p, 0.0, 1.0);\
    }",
  fragmentShader: "\
    in vec2 v_local;\
    in vec4 v_col;\
    void main(){\
      float d = length(v_local);\
      float a = smoothstep(1.0, 0.98, d);\
      if (d>1.02) discard;\
      fragColor = vec4(v_col.rgb, v_col.a * a);\
    }",
  "textures": {}
};
---
out1 : Texture {
  signature: "tsig",
  drawOps: [
  {
    program: "p_bg",
    vertex: "v",
    global: "g",
    textures: { backgroundTexture: "t_bg" }
  },
  {
    program: "p_circles",
    vertex: "v",
    instances: "i",
    global: "g",
    textures: {}
  }],
};
`;
export default script;



