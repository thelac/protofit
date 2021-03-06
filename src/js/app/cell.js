// NOTE: We rely on 'data' as a global variable. It's defined in main.js. We
// will eventually address this. Maybe.

var _ = require('../util/lodash');
var radio = require('radio');
var isMobile = require('../util/mobile').any;

var Cell = function(corners) {
  this.layer = 0;
  this.id = Cell.id;
  Cell.id++;

  this.corners = corners;
  this.center = this.findCenter(this.corners);
  this.sortCorners();
  this.createDrawingPath();
  this.disabled = false;
  this.seats = 0;

  this.children = {};
  return this;
};

Cell.id = 0;

Cell.fromSVG = function(svg) {
  switch (svg.type) {
    case 'g':
      return Cell.fromLines(svg.children());
      break;
    case 'rect':
      return Cell.fromRect(svg);
      break;
    case 'polygon':
      return Cell.fromPolygon(svg);
      break;
    case 'polyline':
      return Cell.fromPolyline(svg);
      break;
  };
};

Cell.fromLines = function(lines) {
  return new Cell(Cell.extractCornersFromLines(lines));
};

Cell.fromRect = function(rect) {
  var tl = {
    x: rect.x(),
    y: rect.y()
  };

  var tr = {
    x: rect.x() + rect.width(),
    y: rect.y()
  };

  var bl = {
    x: rect.x(),
    y: rect.y() + rect.height()
  };

  var br = {
    x: rect.x() + rect.width(),
    y: rect.y() + rect.height()
  };

  return new Cell([tl, tr, bl, br]);
};

Cell.fromPolygon = function(polygon) {
  return new Cell(polygon.array.value.map(function(corner) {
    return {
      x: corner[0],
      y: corner[1]
    };
  }));
};

Cell.fromPolyline = function(polyline) {
  var corners = polyline.array.value.map(function(corner) {
    return {
      x: corner[0],
      y: corner[1]
    };
  });

  return new Cell(Cell.removeDuplicateCorners(corners));
};

Cell.extractCornersFromLines = function(lines) {
  // Grab all line segment ends
  var corners = lines.map(function(line) {
    return [{
      x: line.attr('x1'),
      y: line.attr('y1')
    }, {
      x: line.attr('x2'),
      y: line.attr('y2')
    }];
  });

  return Cell.removeDuplicateCorners(corners);
};

Cell.removeDuplicateCorners = function(corners) {
  corners = _(corners).flattenDeep()
    .remove(function(item, pos, self) {
      for (var i = pos + 1; i < self.length; i++)
        if (_.isEqual(item, self[i]))
          return false;
      return true
    }).value();
  return corners;
}

Cell.merge = function(cells) {
  // For now just join corners; don't bother deleting duplicate corners
  var corners = [];
  _.forOwn(cells, function(cell, id) {
    corners = _.union(corners, cell.corners);
  });

  var merged = new Cell(corners);

  _.forOwn(cells, function(cell, id) {
    // Add all merging cells as children
    merged.children[id] = cell;

    // Remove drawing elements of children
    cell.demote();
  });

  merged.promote();

  return merged;
};

Cell.split = function(merged) {
  _.forOwn(merged.children, function(cell, id) {
    cell.promote();
  });

  return merged.children;
};

Cell.prototype.merged = function() {
  return _.keys(this.children).length > 0;
};

Cell.prototype.draw = function() {
  this.contents = data.nested();

  var bbox = this.drawingPath.bbox();

  var bboxCorners = [{
    x: bbox.x,
    y: bbox.y
  }, {
    x: bbox.x + bbox.width,
    y: bbox.y
  }, {
    x: bbox.x + bbox.width,
    y: bbox.y + bbox.height
  }, {
    x: bbox.x,
    y: bbox.y + bbox.height
  }];

  var center = this.findCenter(bboxCorners)

  var widthLarger = bbox.width > bbox.height;
  var major = widthLarger ? bbox.width : bbox.height;
  var minor = widthLarger ? bbox.height : bbox.width;

  if (this.layer === 2) { // Conference room

    var use = major / data.conferenceLarge.width() > 1.2 ? data.conferenceLarge : data.conferenceSmall;
    var conferenceTable = data.use(use);

    conferenceTable.move(center.x - use.width() / 2,
      center.y - use.height() / 2);

    if (!widthLarger) conferenceTable.rotate(90, center.x, center.y);

    this.contents.add(conferenceTable);
  } else if (this.layer === 3) { // Office
    var desk = data.use(data.deskSmall);
    desk.width(data.deskSmall.width());
    desk.height(data.deskSmall.height());

    var table = data.use(data.table);
    table.width(data.table.width());
    table.height(data.table.height());

    if (widthLarger) {
      var delta = bbox.width / 2 - bbox.width / 6;
      desk.center(center.x + delta, center.y);
      desk.rotate(90, desk.cx(), desk.cy());

      var tdelta = bbox.width / 2 - table.width() / 2 - bbox.width / 10;
      table.center(center.x - tdelta, center.y);
    } else {
      var delta = bbox.height / 2 - bbox.height / 6;
      desk.center(center.x, center.y + delta);
      desk.rotate(180, desk.cx(), desk.cy());

      var tdelta = bbox.height / 2 - table.height() / 2 - bbox.height / 10;
      table.center(center.x, center.y - tdelta);
    }

    this.contents.add(table);
    this.contents.add(desk);
  }

  var walls = this.drawingPath.clone();

  walls.node.removeAttribute('class');
  $(walls.node).css({
    'pointer-events': 'none'
  });

  walls.attr({
    'fill-opacity': 0,
    'stroke': '#999',
    'stroke-weight': 0.5
  });
};

Cell.prototype.erase = function() {
  if (this.contents) {
    this.contents.clear();
    this.contents.remove();
    delete this.contents;
  }
};

// What happens when a cell gets unmerged
Cell.prototype.promote = function() {
  this.createDrawingPath();
  this.createClippingPath(data.getClientToSVGRatio());
};

// What happens when a cell gets merged into another
Cell.prototype.demote = function() {
  this.removeDrawingPath();
  this.removeClippingPath();
  this.erase();
};

Cell.prototype.findCenter = function(corners) {

  var center = corners.reduce(function(a, b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y
    };
  }, {
    x: 0,
    y: 0
  });

  return {
    x: center.x / corners.length,
    y: center.y / corners.length
  };
};

Cell.prototype.sortCorners = function() {
  var that = this;

  that.corners.sort(function(a, b) {
    ax = Math.floor(a.x * 100);
    ay = Math.floor(a.y * 100);
    bx = Math.floor(b.x * 100);
    by = Math.floor(b.y * 100);

    cx = Math.floor(that.center.x * 100);
    cy = Math.floor(that.center.y * 100);

    if (ax - cx >= 0 && bx - cx < 0) {
      return 1;
    }
    if (ax - cx < 0 && bx - cx >= 0) {
      return -1;
    }
    if (ax - cx == 0 && bx - cx == 0) {
      if (ay - cy >= 0 || by - cy >= 0) {
        return ay > by ? 1 : -1;
      }
      return by > ay ? 1 : -1;
    }

    // compute the cross product of vectors (center -> a) x (center -> b)
    var det = (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
    if (det < 0) {
      return 1;
    }
    if (det > 0) {
      return -1;
    }

    // points a and b are on the same line from the center
    // check which point is closer to the center
    var d1 = (ax - cx) * (ax - cx) + (ay - cy) * (ay - cy);
    var d2 = (bx - cx) * (bx - cx) + (by - cy) * (by - cy);
    return d1 > d2 ? 1 : -1;
  });

  for (var i = 0; i < that.corners.length; i++) {
    var indices = [0, 1, 2, 3].map(function(x) {
      return (i + x) % that.corners.length;
    });

    var pts = indices.map(function(x) {
      return that.corners[x];
    });

    if ((Math.abs(pts[1].x - pts[2].x) < 0.0001 || Math.abs(pts[1].y - pts[2].y) < 0.0001) && // 1st and 2nd points are on horizontal or vertical line
      (Math.abs(pts[0].x - pts[2].x) < 0.0001 || Math.abs(pts[0].y - pts[2].y) < 0.0001) && // 0th and 2nd points are on horizontal or vertical line
      (Math.abs(pts[1].x - pts[3].x) < 0.0001 || Math.abs(pts[1].y - pts[3].y) < 0.0001) // 1st and 3rd points are on horizontal or vertical line
    ) {
      that.corners[indices[1]] = that.corners.splice(indices[2], 1, that.corners[indices[1]])[0];
    }
  }

  for (var i = 0; i < that.corners.length; i++) {
    var indices = [0, 1, 2, 3].map(function(x) {
      return (i + x) % that.corners.length;
    });

    var pts = indices.map(function(x) {
      return that.corners[x];
    });

    if ((Math.abs(pts[0].x - pts[1].x) < 0.0001 || Math.abs(pts[0].y - pts[1].y) < 0.0001) && // 1st and 2nd points are on horizontal or vertical line
      (Math.abs(pts[3].x - pts[1].x) < 0.0001 || Math.abs(pts[3].y - pts[1].y) < 0.0001) && // 0th and 2nd points are on horizontal or vertical line
      (Math.abs(pts[2].x - pts[0].x) < 0.0001 || Math.abs(pts[2].y - pts[0].y) < 0.0001) // 1st and 3rd points are on horizontal or vertical line
    ) {
      that.corners[indices[1]] = that.corners.splice(indices[2], 1, that.corners[indices[1]])[0];
    }
  }

  for (var i = 0; i < that.corners.length; i++) {
    var indices = [0, 1, 2, 3].map(function(x) {
      return (i + x) % that.corners.length;
    });

    var pts = indices.map(function(x) {
      return that.corners[x];
    });

    if ((Math.abs(pts[1].x - pts[2].x) < 0.0001 || Math.abs(pts[1].y - pts[2].y) < 0.0001) && // 1st and 2nd points are on horizontal or vertical line
      (Math.abs(pts[0].x - pts[2].x) < 0.0001 || Math.abs(pts[0].y - pts[2].y) < 0.0001) && // 0th and 2nd points are on horizontal or vertical line
      (Math.abs(pts[1].x - pts[3].x) < 0.0001 || Math.abs(pts[1].y - pts[3].y) < 0.0001) // 1st and 3rd points are on horizontal or vertical line
    ) {
      that.corners[indices[1]] = that.corners.splice(indices[2], 1, that.corners[indices[1]])[0];
    }
  }
};

Cell.prototype.createDrawingPath = function() {
  var that = this;

  that.drawingPath = data.path();
  that.drawingPath.node.setAttribute('class', 'cell');

  that.corners.map(function(corner, index) {
    if (index == 0) {
      that.drawingPath.M(corner.x, corner.y);
    } else {
      that.drawingPath.L(corner.x, corner.y);
    }
  });

  that.drawingPath.Z();

  if (isMobile) {
    that.drawingPath.touchstart(function(event) {
      // Broadcast a cell click event, no dragging
      radio('cell-click').broadcast(that, false);
    });
  } else {
    that.drawingPath.mousedown(function(event) {
      radio('cell-click').broadcast(that, false);
      data.dragging = true;
    });
    that.drawingPath.mouseover(function(event) {
      if (data.dragging) {
        radio('cell-click').broadcast(that, true);
      } else {
        radio('cell-mouseover').broadcast(that);
      }
    });
    that.drawingPath.mouseout(function(event) {
      radio('cell-mouseout').broadcast(that);
    });
    that.drawingPath.mouseup(function(event) {
      radio('cell-mouseup').broadcast(that);
      data.dragging = false;
    });
  }
};

Cell.prototype.removeDrawingPath = function() {
  if (this.drawingPath) {
    this.drawingPath.remove();
    delete this.drawingPath;
  }
};

Cell.prototype.createClippingPath = function(ratio) {
  var that = this;
  var transformedCorners = that.corners.map(function(corner) {
    return {
      x: (corner.x - data.viewbox().x) * ratio,
      y: (corner.y - data.viewbox().y) * ratio
    };
  });

  that.clippingPath = data.path();
  transformedCorners.map(function(corner, index) {
    if (index == 0) {
      that.clippingPath.M(corner.x, corner.y);
    } else {
      that.clippingPath.L(corner.x, corner.y);
    }
  });
  that.clippingPath.Z();
  that.clippingPath.remove();
};

Cell.prototype.removeClippingPath = function(ratio) {
  if (this.clippingPath) {
    this.clippingPath.remove();
    delete this.clippingPath;
  }
};

Cell.prototype.setData = function(attr, value) {
  this.drawingPath.node.dataset[attr] = value;
};

Cell.prototype.setLayer = function(layer) {
  this.setData('layer', layer);
  this.layer = layer;
};

Cell.prototype.disable = function() {
  this.disabled = true;
  this.setData('disabled', true);
};

Cell.prototype.enable = function() {
  this.disabled = false;

  // TODO: This might not work
  this.setData('disabled', false);
};

Cell.prototype.numChildren = function() {
  return _.keys(this.children).length;
};

radio('cell-mouseover').subscribe(function(cell) {
  cell.drawingPath.node.dataset.hover = 1;
});

radio('cell-mouseout').subscribe(function(cell) {
  cell.drawingPath.node.dataset.hover = 0;
});

module.exports = Cell;