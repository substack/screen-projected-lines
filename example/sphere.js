var regl = require('regl')()
var camera = require('regl-camera')(regl, { distance: 1.7 })
var icosphere = require('icosphere')
var glsl = require('glslify')
var wireframe = require('../')

var draw = sphere(regl)
regl.frame(function () {
  regl.clear({ color: [0,0,0,1], depth: true })
  camera(function () { draw() })
})

function sphere (regl) {
  var mesh = wireframe(icosphere(2))
  return regl({
    frag: `
      precision mediump float;
      void main () {
        gl_FragColor = vec4(0,1,1,1);
      }
    `,
    vert: glsl`
      #pragma glslify: linevoffset = require('../')
      precision mediump float;
      uniform mat4 projection, view;
      uniform float aspect;
      attribute vec3 position, nextpos;
      attribute float direction;
      void main () {
        mat4 proj = projection * view;
        vec4 p = proj*vec4(position,1);
        vec4 n = proj*vec4(nextpos,1);
        vec4 offset = linevoffset(p, n, direction, aspect);
        gl_Position = p + offset*0.02/p.z;
      }
    `,
    attributes: {
      position: mesh.positions,
      nextpos: mesh.nextPositions,
      direction: mesh.directions
    },
    elements: mesh.cells,
    uniforms: {
      aspect: function (context) {
        return context.viewportWidth / context.viewportHeight
      }
    }
  })
}
