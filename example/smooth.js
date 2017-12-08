var regl = require('regl')()
var camera = require('regl-camera')(regl,
  { distance: 50, phi: 0.3, theta: -1.4 })
var teapot = require('teapot')
var glsl = require('glslify')
var wireframe = require('../')
var anormals = require('angle-normals')

function borderSize (context) {
  return 0.1 / Math.max(context.viewportWidth, context.viewportHeight)
}

var draw = {
  wire: wire(regl),
  solid: solid(regl),
  border: border(regl)
}
regl.frame(function () {
  regl.clear({ color: [0.6,0.7,1,1], depth: true })
  camera(function () {
    draw.solid()
    draw.border()
    draw.wire()
  })
})

function wire (regl) {
  var mesh = wireframe(teapot)
  var screen = [0,0]
  return regl({
    frag: `
      precision mediump float;
      varying float vangle;
      uniform float time;
      void main () {
        float s = 0.4+pow(sin(time*${Math.PI*2}*0.05),2.0)*0.4;
        float smooth = step(s,mod(mod(vangle/${Math.PI}*0.5+0.5,1.0)+1.0,1.0));
        gl_FragColor = vec4(0,0,0,smooth);
      }
    `,
    vert: glsl`
      #pragma glslify: linevoffset = require('../')
      precision mediump float;
      uniform mat4 projection, view;
      uniform float aspect, borderSize;
      attribute vec3 position, nextpos;
      attribute float direction, angle;
      uniform vec2 screen;
      varying float vangle;
      void main () {
        vangle = angle;
        mat4 proj = projection * view;
        vec4 p = proj*vec4(position,1);
        vec4 n = proj*vec4(nextpos,1);
        vec4 offset = linevoffset(p, n, direction, aspect);
        gl_Position = p + offset*borderSize*min(screen.x,screen.y);
      }
    `,
    attributes: {
      position: mesh.positions,
      nextpos: mesh.nextPositions,
      direction: mesh.directions,
      angle: mesh.angles
    },
    elements: mesh.cells,
    uniforms: {
      aspect: function (context) {
        return context.viewportWidth / context.viewportHeight
      },
      screen: function (context) {
        screen[0] = context.viewportWidth
        screen[1] = context.viewportHeight
        return screen
      },
      time: regl.context('time'),
      borderSize: borderSize
    },
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    }
  })
}

function border (regl) {
  var mesh = teapot
  return regl({
    frag: `
      precision mediump float;
      void main () {
        gl_FragColor = vec4(0,0,0,1);
      }
    `,
    vert: glsl`
      #pragma glslify: linevoffset = require('../')
      precision mediump float;
      uniform mat4 projection, view;
      uniform float borderSize;
      attribute vec3 position, normal;
      void main () {
        gl_Position = projection * view
          * vec4(position+normal*borderSize,1);
      }
    `,
    attributes: {
      position: mesh.positions,
      normal: anormals(mesh.cells, mesh.positions)
    },
    cull: { enable: true, face: 'front' },
    elements: mesh.cells,
    uniforms: {
      aspect: function (context) {
        return context.viewportWidth / context.viewportHeight
      },
      borderSize: borderSize
    }
  })
}

function solid (regl) {
  var mesh = teapot
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vnorm;
      void main () {
        vec3 L = normalize(vec3(0.1,5,0.2));
        float x = dot(L,normalize(vnorm));
        gl_FragColor = vec4(vec3(x)*0.1+0.9,1);
      }
    `,
    vert: glsl`
      #pragma glslify: linevoffset = require('../')
      precision mediump float;
      uniform mat4 projection, view;
      attribute vec3 position, normal;
      uniform float borderSize;
      varying vec3 vnorm;
      void main () {
        vnorm = normal;
        gl_Position = projection * view
          * vec4(position-normal*0.1,1);
      }
    `,
    attributes: {
      position: mesh.positions,
      normal: anormals(mesh.cells, mesh.positions)
    },
    elements: mesh.cells,
    uniforms: {
      aspect: function (context) {
        return context.viewportWidth / context.viewportHeight
      },
      borderSize: borderSize
    }
  })
}
