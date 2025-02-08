import { GeoJSON } from 'geojson';

/**

 * GeoJSON equality checking utility.
 * Adapted from https://github.com/geosquare/geojson-equality
 *
 * @memberof helpers
 * @type {Class}
 */
declare class GeojsonEquality {
    private precision;
    private direction;
    private compareProperties;
    constructor(opts?: {
        precision?: number;
        direction?: boolean;
        compareProperties?: boolean;
    });
    compare(g1: GeoJSON, g2: GeoJSON): boolean;
    private compareCoord;
    private compareLine;
    private fixStartIndex;
    private comparePath;
    private comparePolygon;
    private compareGeometryCollection;
    private compareFeature;
    private compareFeatureCollection;
    private compareBBox;
}
declare function geojsonEquality(g1: GeoJSON, g2: GeoJSON, opts?: {
    precision?: number;
    direction?: boolean;
    compareProperties?: boolean;
}): boolean;

export { GeojsonEquality, GeojsonEquality as default, geojsonEquality };
