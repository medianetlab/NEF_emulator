# geojson-equality-ts

Check two valid geojson geometries for equality.

This library is a fork of geojson-equality by Gagan Bansal (@gagan-bansal), ported to Typescript by Samir Shah (@solarissmoke). Published and maintained going forward by James Beard (@smallsaucepan).

## Installation

```
npm install geojson-equality-ts
```

## Usage

Use as either a class or function.

```typescript
import { geojsonEquality, GeojsonEquality } from "geojson-equality";

// ... create g1 and g2 GeoJSON objects

geojsonEquality(g1, g2, { precision: 3 }); // returns boolean

const eq = new GeojsonEquality({ precision: 3 });
eq.compare(g1, g2); // returns boolean
```

In more detail.

```typescript
const GeojsonEquality = require("geojson-equality");
const eq = new GeojsonEquality();

const g1: Polygon = {
    type: "Polygon",
    coordinates: [
      [
        [30, 10],
        [40, 40],
        [20, 40],
        [10, 20],
        [30, 10],
      ],
    ],
  },
  g2: Polygon = {
    type: "Polygon",
    coordinates: [
      [
        [30, 10],
        [40, 40],
        [20, 40],
        [10, 20],
        [30, 10],
      ],
    ],
  };

eq.compare(g1, g2); // returns true
const g3: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [300, 100],
      [400, 400],
      [200, 400],
      [100, 200],
      [300, 100],
    ],
  ],
};

eq.compare(g1, g3); // returns false
```

## Options

**precision** _number_ floating point precision required. Defualt is **17**.

```typescript
const g1: Point = { type: "Point", coordinates: [30.2, 10] };
const g2: Point = { type: "Point", coordinates: [30.22233, 10] };

geojsonEquality(g1, g2, { precision: 3 }); // returns false

geojsonEquality(g1, g2, { precision: 1 }); // returns true
```

**direction** _boolean_ direction of LineString or Polygon (orientation) is ignored if false. Default is **false**.

```typescript
const g1: LineString = {
    type: "LineString",
    coordinates: [
      [30, 10],
      [10, 30],
      [40, 40],
    ],
  },
  g2: LineString = {
    type: "LineString",
    coordinates: [
      [40, 40],
      [10, 30],
      [30, 10],
    ],
  };

geojsonEquality(g1, g2, { direction: false }); // returns true

geojsonEquality(g1, g2, { direction: true }); // returns false
```

**compareProperties** _boolean_ when comparing features, take their properties into account. Default is true.

```typescript
const g1: Feature<Point> = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [30, 10],
    },
    properties: { foo: "bar" },
  },
  g2: Feature<Point> = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [30, 10],
    },
    properties: { foo: "BAZZZZ" },
  };

geojsonEquality(g1, g2); // returns false

geojsonEquality(g1, g2, { compareProperties: false }); // returns true
```

## Contributing

Once you run

`npm install`

then for running test

`npm run test`

to create build

`npm run build`

PRs are welcome.

## License

This project is licensed under the terms of the MIT license.
