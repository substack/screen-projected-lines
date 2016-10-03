var wireframe = require('../')
var test = require('tape')

test('triangle', function (t) {
  var mesh = {
    positions: [[4,4,2],[4,-4,-1],[-4,0,1]],
    cells: [[0,1,2]]
  }
  var wmesh = wireframe(mesh)
  t.equal(wmesh.positions.length, 6, '6 vertices')
  t.equal(wmesh.nextPositions.length, 6, '6 next vertices')
  t.equal(wmesh.directions.length, 6, '6 directions')
  t.equal(wmesh.cells.length, 6, '6 cells')
  t.end()
})
