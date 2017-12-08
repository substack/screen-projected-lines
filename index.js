var findAngle = require('shared-edge-angle')
var copy = require('gl-vec3/copy')

var A = [[0,0,0],[0,0,0],[0,0,0]]
var B = [[0,0,0],[0,0,0],[0,0,0]]

module.exports = function (mesh, opts) {
  if (!opts) opts = {}
  var pts = [], npts = [], dirs = [], cells = [], angles = []
  var vars = opts.attributes ? {} : null
  var vkeys = vars && Object.keys(opts.attributes)
  if (vars) {
    for (var k = 0; k < vkeys.length; k++) {
      vars[vkeys[k]] = []
    }
  }
  var mcells = mesh.cells || []
  var edges = {}
  for (var i = 0; i < mcells.length; i++) {
    var c = mcells[i]
    if (c.length === 3) {
      for (var j = 0; j < 3; j++) {
        var c0 = c[j], c1 = c[(j+1)%3]
        var ek = edgeKey(c0,c1)
        if (edges[ek] === undefined) edges[ek] = [i]
        else edges[ek].push(i)
      }
    } else if (c.length === 2) {
      var c0 = c[0], c1 = c[1]
      var ek = edgeKey(c0,c1)
      if (edges[ek] === undefined) edges[ek] = [i]
      else edges[ek].push(i)
    }
  }
  for (var i = 0; i < mcells.length; i++) {
    var c = mcells[i]
    var len = c.length
    for (var j = 0; j < len; j++) {
      var c0 = c[j], c1 = c[(j+1)%len]
      var ek = edgeKey(c0,c1)
      var e = edges[ek]
      var theta = Math.PI
      var k = pts.length
      if (e.length >= 2) {
        var ce0 = mcells[e[0]]
        var ce1 = mcells[e[1]]
        copy(A[0], mesh.positions[ce0[0]])
        copy(A[1], mesh.positions[ce0[1]])
        copy(A[2], mesh.positions[ce0[2]])
        copy(B[0], mesh.positions[ce1[0]])
        copy(B[1], mesh.positions[ce1[1]])
        copy(B[2], mesh.positions[ce1[2]])
        theta = findAngle(A,B)
      }
      pts.push(mesh.positions[c0], mesh.positions[c0])
      pts.push(mesh.positions[c1], mesh.positions[c1])
      npts.push(pts[k+2],pts[k+3],pts[k],pts[k+1])
      dirs.push(1,-1,1,-1)
      angles.push(theta,theta,theta,theta)
      if (vars) {
        for (var k = 0; k < vkeys.length; k++) {
          var vkey = vkeys[k]
          vars[vkey].push(opts.attributes[vkey][c0[0]])
          vars[vkey].push(opts.attributes[vkey][c0[1]])
          vars[vkey].push(opts.attributes[vkey][c1[0]])
          vars[vkey].push(opts.attributes[vkey][c1[1]])
        }
      }
      cells.push([k,k+1,k+2],[k,k+2,k+3])
    }
  }
  var medges = mesh.edges || []
  for (var i = 0; i < medges.length; i++) {
    var j = pts.length
    var c = medges[i]
    pts.push(mesh.positions[c[0]])
    pts.push(mesh.positions[c[0]])
    pts.push(mesh.positions[c[1]])
    pts.push(mesh.positions[c[1]])
    if (vars) {
      for (var k = 0; k < vkeys.length; k++) {
        var vkey = vkeys[k]
        vars[vkey].push(opts.attributes[vkey][c[0]])
        vars[vkey].push(opts.attributes[vkey][c[0]])
        vars[vkey].push(opts.attributes[vkey][c[1]])
        vars[vkey].push(opts.attributes[vkey][c[1]])
      }
    }
    npts.push(pts[j+2],pts[j+3],pts[j],pts[j+1])
    dirs.push(1,-1,1,-1)
    cells.push([j,j+1,j+2],[j,j+2,j+3])
  }
  /*
  for (var i = 0; i < mcells.length; i++) {
    var j = pts.length
    var c = mcells[i]
    if (c.length === 2) {
      pts.push(mesh.positions[c[0]])
      pts.push(mesh.positions[c[0]])
      pts.push(mesh.positions[c[1]])
      pts.push(mesh.positions[c[1]])
      if (vars) {
        for (var k = 0; k < vkeys.length; k++) {
          var vkey = vkeys[k]
          vars[vkey].push(opts.attributes[vkey][c[0]])
          vars[vkey].push(opts.attributes[vkey][c[0]])
          vars[vkey].push(opts.attributes[vkey][c[1]])
          vars[vkey].push(opts.attributes[vkey][c[1]])
        }
      }
      npts.push(pts[j+2],pts[j+3],pts[j],pts[j+1])
      dirs.push(1,-1,1,-1)
      cells.push([j,j+1,j+2],[j,j+2,j+3])
    } else if (c.length === 3) {
      pts.push(mesh.positions[c[0]])
      pts.push(mesh.positions[c[0]])
      pts.push(mesh.positions[c[1]])
      pts.push(mesh.positions[c[1]])
      pts.push(mesh.positions[c[2]])
      pts.push(mesh.positions[c[2]])
      if (angles !== null) {
        // ...
      }
      if (vars) {
        for (var k = 0; k < vkeys.length; k++) {
          var vkey = vkeys[k]
          vars[vkey].push(opts.attributes[vkey][c[0]])
          vars[vkey].push(opts.attributes[vkey][c[0]])
          vars[vkey].push(opts.attributes[vkey][c[1]])
          vars[vkey].push(opts.attributes[vkey][c[1]])
          vars[vkey].push(opts.attributes[vkey][c[2]])
          vars[vkey].push(opts.attributes[vkey][c[2]])
        }
      }
      npts.push(pts[j+2],pts[j+3],pts[j+4],pts[j+5],pts[j],pts[j+1])
      dirs.push(1,-1,1,-1,1,-1)
      cells.push([j,j+1,j+2],[j,j+2,j+3])
      cells.push([j+2,j+3,j+4],[j+2,j+4,j+5])
      cells.push([j+4,j+5,j],[j+4,j,j+1])
    } else {
      throw new Error('expected a triangle, got '
        + c.length+'-sided cell')
    }
  }
  */
  return {
    positions: pts,
    cells: cells,
    nextPositions: npts,
    directions: dirs,
    attributes: vars,
    angles: angles
  }
}

function edgeKey (a, b) {
  return a < b ? a+','+b : b+','+a
}
