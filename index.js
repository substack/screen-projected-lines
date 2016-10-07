module.exports = function (mesh) {
  var pts = [], npts = [], dirs = [], cells = []
  var medges = mesh.edges || []
  for (var i = 0; i < medges.length; i++) {
    var j = pts.length
    var c = medges[i]
    pts.push(mesh.positions[c[0]])
    pts.push(mesh.positions[c[0]])
    pts.push(mesh.positions[c[1]])
    pts.push(mesh.positions[c[1]])
    npts.push(pts[j+2],pts[j+3],pts[j],pts[j+1])
    dirs.push(1,-1,1,-1)
    cells.push([j,j+1,j+2],[j,j+2,j+3])
  }
  var mcells = mesh.cells || []
  for (var i = 0; i < mcells.length; i++) {
    var j = pts.length
    var c = mcells[i]
    if (c.length === 2) {
      pts.push(mesh.positions[c[0]])
      pts.push(mesh.positions[c[0]])
      pts.push(mesh.positions[c[1]])
      pts.push(mesh.positions[c[1]])
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
  return {
    positions: pts,
    cells: cells,
    nextPositions: npts,
    directions: dirs
  }
}
