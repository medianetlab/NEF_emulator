"use strict";Object.defineProperty(exports, "__esModule", {value: true});// index.ts








var _helpers = require('@turf/helpers');
function randomPosition(bbox) {
  checkBBox(bbox);
  return randomPositionUnchecked(bbox);
}
function randomPositionUnchecked(bbox) {
  if (Array.isArray(bbox)) {
    return coordInBBox(bbox);
  }
  if (bbox && bbox.bbox) {
    return coordInBBox(bbox.bbox);
  }
  return [lon(), lat()];
}
function checkBBox(bbox) {
  if (bbox == null) {
    return;
  } else if (Array.isArray(bbox)) {
    _helpers.validateBBox.call(void 0, bbox);
  } else if (bbox.bbox != null) {
    _helpers.validateBBox.call(void 0, bbox.bbox);
  }
}
function randomPoint(count, options = {}) {
  checkBBox(options.bbox);
  if (count === void 0 || count === null) {
    count = 1;
  }
  const features = [];
  for (let i = 0; i < count; i++) {
    features.push(_helpers.point.call(void 0, randomPositionUnchecked(options.bbox)));
  }
  return _helpers.featureCollection.call(void 0, features);
}
function randomPolygon(count, options = {}) {
  checkBBox(options.bbox);
  if (count === void 0 || count === null) {
    count = 1;
  }
  if (options.bbox === void 0 || options.bbox === null) {
    options.bbox = [-180, -90, 180, 90];
  }
  if (!_helpers.isNumber.call(void 0, options.num_vertices) || options.num_vertices === void 0) {
    options.num_vertices = 10;
  }
  if (!_helpers.isNumber.call(void 0, options.max_radial_length) || options.max_radial_length === void 0) {
    options.max_radial_length = 10;
  }
  const bboxWidth = Math.abs(options.bbox[0] - options.bbox[2]);
  const bboxHeight = Math.abs(options.bbox[1] - options.bbox[3]);
  const maxRadius = Math.min(bboxWidth / 2, bboxHeight / 2);
  if (options.max_radial_length > maxRadius) {
    throw new Error("max_radial_length is greater than the radius of the bbox");
  }
  const paddedBbox = [
    options.bbox[0] + options.max_radial_length,
    options.bbox[1] + options.max_radial_length,
    options.bbox[2] - options.max_radial_length,
    options.bbox[3] - options.max_radial_length
  ];
  const features = [];
  for (let i = 0; i < count; i++) {
    let vertices = [];
    const circleOffsets = [...Array(options.num_vertices + 1)].map(Math.random);
    circleOffsets.forEach((cur, index, arr) => {
      arr[index] = index > 0 ? cur + arr[index - 1] : cur;
    });
    circleOffsets.forEach((cur) => {
      cur = cur * 2 * Math.PI / circleOffsets[circleOffsets.length - 1];
      const radialScaler = Math.random();
      vertices.push([
        radialScaler * (options.max_radial_length || 10) * Math.sin(cur),
        radialScaler * (options.max_radial_length || 10) * Math.cos(cur)
      ]);
    });
    vertices[vertices.length - 1] = vertices[0];
    vertices = vertices.map(
      vertexToCoordinate(randomPositionUnchecked(paddedBbox))
    );
    features.push(_helpers.polygon.call(void 0, [vertices]));
  }
  return _helpers.featureCollection.call(void 0, features);
}
function randomLineString(count, options = {}) {
  options = options || {};
  if (!_helpers.isObject.call(void 0, options)) {
    throw new Error("options is invalid");
  }
  const bbox = options.bbox;
  checkBBox(bbox);
  let num_vertices = options.num_vertices;
  let max_length = options.max_length;
  let max_rotation = options.max_rotation;
  if (count === void 0 || count === null) {
    count = 1;
  }
  if (!_helpers.isNumber.call(void 0, num_vertices) || num_vertices === void 0 || num_vertices < 2) {
    num_vertices = 10;
  }
  if (!_helpers.isNumber.call(void 0, max_length) || max_length === void 0) {
    max_length = 1e-4;
  }
  if (!_helpers.isNumber.call(void 0, max_rotation) || max_rotation === void 0) {
    max_rotation = Math.PI / 8;
  }
  const features = [];
  for (let i = 0; i < count; i++) {
    const startingPoint = randomPositionUnchecked(bbox);
    const vertices = [startingPoint];
    for (let j = 0; j < num_vertices - 1; j++) {
      const priorAngle = j === 0 ? Math.random() * 2 * Math.PI : Math.tan(
        (vertices[j][1] - vertices[j - 1][1]) / (vertices[j][0] - vertices[j - 1][0])
      );
      const angle = priorAngle + (Math.random() - 0.5) * max_rotation * 2;
      const distance = Math.random() * max_length;
      vertices.push([
        vertices[j][0] + distance * Math.cos(angle),
        vertices[j][1] + distance * Math.sin(angle)
      ]);
    }
    features.push(_helpers.lineString.call(void 0, vertices));
  }
  return _helpers.featureCollection.call(void 0, features);
}
function vertexToCoordinate(hub) {
  return (cur) => {
    return [cur[0] + hub[0], cur[1] + hub[1]];
  };
}
function rnd() {
  return Math.random() - 0.5;
}
function lon() {
  return rnd() * 360;
}
function lat() {
  return rnd() * 180;
}
function coordInBBox(bbox) {
  return [
    Math.random() * (bbox[2] - bbox[0]) + bbox[0],
    Math.random() * (bbox[3] - bbox[1]) + bbox[1]
  ];
}





exports.randomLineString = randomLineString; exports.randomPoint = randomPoint; exports.randomPolygon = randomPolygon; exports.randomPosition = randomPosition;
//# sourceMappingURL=index.cjs.map