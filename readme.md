# screen-projected-lines

draw wireframes using triangles in [screen-projected coordinates][1]

This module triangulates edges from a [simplicial complex][2] and returns
arrays you can use as attributes in a vertex shader.

This module does not currently support miter joins, but that would be nice to
have.

[1]: https://mattdesl.svbtle.com/drawing-lines-is-hard#screenspace-projected-lines_2
[2]: https://npmjs.com/package/simplicial-complex

# example

In this demo, we will draw a wireframe sphere with an exaggerated sense of
depth by dividing the offset vector by `p.z`.

[view this demo](https://substack.neocities.org/wireframe_sphere.html)

``` js
var regl = require('regl')()
var camera = require('regl-camera')(regl, { distance: 1.7 })
var icosphere = require('icosphere')
var glsl = require('glslify')
var wireframe = require('screen-projected-lines')

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
      #pragma glslify: linevoffset = require('screen-projected-lines')
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
```

To compile this code, use browserify with the glslify transform:

```
browserify sphere.js -t glslify > bundle.js
```

# api

``` js
var wireframe = require('screen-projected-lines')
```

``` glsl
#pragma glslify: linevoffset = require('screen-projected-lines')
```

## var wmesh = wireframe(mesh, opts={})

Create a wireframe mesh given an existing triangular mesh.

The wireframe mesh has these properties:

* `wmesh.positions` - array of vertex `[x,y,z]` arrays
* `wmesh.cells` - array of triangle indices
* `wmesh.nextPositions` - array of the next vertex coordinates
* `wmesh.directions` - array of values to use for which side of each vertex
* `wmesh.attributes` - extra attributes declared alongside vertices

The normals are not computed on the CPU here so that you can apply additional
displacements in your vertex shader.

Optionally provide `opts.attributes` to declare attributes alongside the
original vertices. For example, if you want to use computed surface normals to
displace your wireframe mesh, you could do:

```
var anormals = require('angle-normals')
var wmesh = wireframe(mesh, {
  attributes: {
    normals: anormals(mesh.cells, mesh.positions)
  }
})
```

and then you can use `wmesh.attributes.normals` alongside `wmesh.positions` as
an attribute.

## vec4 offset = linevoffset(vec4 pos, vec4 nextpos, float direction, float aspect)

Return the screen offset to apply to `pos` given the current vertex screen
position `pos`, the screen position of the next vertex in the edge `nextpos`,
the direction of the vertex (`-1.0` or `1.0`), and the aspect ratio.

The offset vector is normalized, so multiply by a constant to adjust thickness.

To have the thinkness vary with depth like everything else:

``` glsl
vec4 offset = linevoffset(p, n, direction, aspect);
gl_Position = p + offset*0.02;
```

To have the thinkness have an exaggerated sense of depth:

``` glsl
vec4 offset = linevoffset(p, n, direction, aspect);
gl_Position = p + offset*0.02/p.z;
```

To have the thinkness not vary with depth:

``` glsl
vec4 offset = linevoffset(p, n, direction, aspect);
gl_Position = p + offset*0.02*p.z;
```

# install

```
npm install screen-projected-lines
```

# license

BSD
