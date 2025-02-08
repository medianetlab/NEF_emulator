"use strict";Object.defineProperty(exports, "__esModule", {value: true});var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.ts
var _GeojsonEquality = class _GeojsonEquality {
  constructor(opts) {
    this.direction = false;
    this.compareProperties = true;
    var _a, _b, _c;
    this.precision = 10 ** -((_a = opts == null ? void 0 : opts.precision) != null ? _a : 17);
    this.direction = (_b = opts == null ? void 0 : opts.direction) != null ? _b : false;
    this.compareProperties = (_c = opts == null ? void 0 : opts.compareProperties) != null ? _c : true;
  }
  compare(g1, g2) {
    if (g1.type !== g2.type) {
      return false;
    }
    if (!sameLength(g1, g2)) {
      return false;
    }
    switch (g1.type) {
      case "Point":
        return this.compareCoord(g1.coordinates, g2.coordinates);
      case "LineString":
        return this.compareLine(g1.coordinates, g2.coordinates);
      case "Polygon":
        return this.comparePolygon(g1, g2);
      case "GeometryCollection":
        return this.compareGeometryCollection(g1, g2);
      case "Feature":
        return this.compareFeature(g1, g2);
      case "FeatureCollection":
        return this.compareFeatureCollection(g1, g2);
      default:
        if (g1.type.startsWith("Multi")) {
          const g1s = explode(g1);
          const g2s = explode(
            g2
          );
          return g1s.every(
            (g1part) => g2s.some((g2part) => this.compare(g1part, g2part))
          );
        }
    }
    return false;
  }
  compareCoord(c1, c2) {
    return c1.length === c2.length && c1.every((c, i) => Math.abs(c - c2[i]) < this.precision);
  }
  compareLine(path1, path2, ind = 0, isPoly = false) {
    if (!sameLength(path1, path2)) {
      return false;
    }
    const p1 = path1;
    let p2 = path2;
    if (isPoly && !this.compareCoord(p1[0], p2[0])) {
      const startIndex = this.fixStartIndex(p2, p1);
      if (!startIndex) {
        return false;
      } else {
        p2 = startIndex;
      }
    }
    const sameDirection = this.compareCoord(p1[ind], p2[ind]);
    if (this.direction || sameDirection) {
      return this.comparePath(p1, p2);
    } else {
      if (this.compareCoord(p1[ind], p2[p2.length - (1 + ind)])) {
        return this.comparePath(p1.slice().reverse(), p2);
      }
      return false;
    }
  }
  fixStartIndex(sourcePath, targetPath) {
    let correctPath, ind = -1;
    for (let i = 0; i < sourcePath.length; i++) {
      if (this.compareCoord(sourcePath[i], targetPath[0])) {
        ind = i;
        break;
      }
    }
    if (ind >= 0) {
      correctPath = [].concat(
        sourcePath.slice(ind, sourcePath.length),
        sourcePath.slice(1, ind + 1)
      );
    }
    return correctPath;
  }
  comparePath(p1, p2) {
    return p1.every((c, i) => this.compareCoord(c, p2[i]));
  }
  comparePolygon(g1, g2) {
    if (this.compareLine(g1.coordinates[0], g2.coordinates[0], 1, true)) {
      const holes1 = g1.coordinates.slice(1, g1.coordinates.length);
      const holes2 = g2.coordinates.slice(1, g2.coordinates.length);
      return holes1.every(
        (h1) => holes2.some((h2) => this.compareLine(h1, h2, 1, true))
      );
    }
    return false;
  }
  compareGeometryCollection(g1, g2) {
    return sameLength(g1.geometries, g2.geometries) && this.compareBBox(g1, g2) && g1.geometries.every((g, i) => this.compare(g, g2.geometries[i]));
  }
  compareFeature(g1, g2) {
    return g1.id === g2.id && (this.compareProperties ? equal(g1.properties, g2.properties) : true) && this.compareBBox(g1, g2) && this.compare(g1.geometry, g2.geometry);
  }
  compareFeatureCollection(g1, g2) {
    return sameLength(g1.features, g2.features) && this.compareBBox(g1, g2) && g1.features.every((f, i) => this.compare(f, g2.features[i]));
  }
  compareBBox(g1, g2) {
    return Boolean(!g1.bbox && !g2.bbox) || (g1.bbox && g2.bbox ? this.compareCoord(g1.bbox, g2.bbox) : false);
  }
};
__name(_GeojsonEquality, "GeojsonEquality");
var GeojsonEquality = _GeojsonEquality;
function sameLength(g1, g2) {
  return g1.coordinates ? g1.coordinates.length === g2.coordinates.length : g1.length === g2.length;
}
__name(sameLength, "sameLength");
function explode(g) {
  return g.coordinates.map((part) => ({
    type: g.type.replace("Multi", ""),
    coordinates: part
  }));
}
__name(explode, "explode");
function geojsonEquality(g1, g2, opts) {
  const eq = new GeojsonEquality(opts);
  return eq.compare(g1, g2);
}
__name(geojsonEquality, "geojsonEquality");
function equal(object1, object2) {
  if (object1 === null && object2 === null) {
    return true;
  }
  if (object1 === null || object2 === null) {
    return false;
  }
  const objKeys1 = Object.keys(object1);
  const objKeys2 = Object.keys(object2);
  if (objKeys1.length !== objKeys2.length) return false;
  for (var key of objKeys1) {
    const value1 = object1[key];
    const value2 = object2[key];
    const isObjects = isObject(value1) && isObject(value2);
    if (isObjects && !equal(value1, value2) || !isObjects && value1 !== value2) {
      return false;
    }
  }
  return true;
}
__name(equal, "equal");
var isObject = /* @__PURE__ */ __name((object) => {
  return object != null && typeof object === "object";
}, "isObject");
var geojson_equality_ts_default = GeojsonEquality;




exports.GeojsonEquality = GeojsonEquality; exports.default = geojson_equality_ts_default; exports.geojsonEquality = geojsonEquality;
//# sourceMappingURL=index.cjs.map