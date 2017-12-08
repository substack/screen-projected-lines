var wireframe = require('../')
var test = require('tape')

test('triangle', function (t) {
  var mesh = {
    positions: [[4,4,2],[4,-4,-1],[-4,0,1]],
    cells: [[0,1,2]]
  }
  var wmesh = wireframe(mesh)
  t.ok(wmesh.positions.length >= 6, '>=6 vertices')
  t.ok(wmesh.nextPositions.length >= 6, '>=6 next vertices')
  t.ok(wmesh.directions.length >= 6, '>=6 directions')
  t.ok(wmesh.cells.length >= 6, '>=6 cells')
  t.end()
})

test('edges', function (t) {
  var mesh = {
    positions: [[4,4,2],[4,-4,-1],[-4,0,1]],
    edges: [[0,1],[1,2]]
  }
  var wmesh = wireframe(mesh)
  t.ok(wmesh.positions.length >= 8, '8 vertices')
  t.ok(wmesh.nextPositions.length >= 8, '8 next vertices')
  t.ok(wmesh.directions.length >= 8, '8 directions')
  t.ok(wmesh.cells.length >= 4, '4 cells')
  t.end()
})

test('2-element cells', function (t) {
  var mesh = {
    positions: [[4,4,2],[4,-4,-1],[-4,0,1]],
    cells: [[0,1],[1,2]]
  }
  var wmesh = wireframe(mesh)
  t.ok(wmesh.positions.length >= 8, '>= 8 vertices')
  t.ok(wmesh.nextPositions.length >= 8, '>= 8 next vertices')
  t.ok(wmesh.directions.length >= 8, '>= 8 directions')
  t.ok(wmesh.cells.length >= 4, '>= 4 cells')
  t.end()
})
