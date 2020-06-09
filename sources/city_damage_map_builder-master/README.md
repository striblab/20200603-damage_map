# city_damage_map_builder

Shell scripts to build a map of building footprints in Hennepin and Ramsey counties and to link geocoded businesses to those buildign footprints

To get started:
```
pipenv install
pipenv shell
```

### To build base layers of buildings and parcels (which you generally shouldn't need to do again):
`./make_city_footprint_maps.sh`

To run the basemaps script, you'll need:
- Hennepin and Ramsey parcel shapefiles
- Hennepin and Ramsey county outline shapefiles

The script generates the rest.

### To assign geocoded businesses to builings:
`./build_damage_map.sh`

To run the basemaps script, you'll need:
- shp/buildings_hennepin_ramsey_joined.shp

The build script pulls from the form responses here: https://docs.google.com/spreadsheets/d/1yxbb7aamQw6ePRB17nEKCLxIIJbvdFYmS-GEOTCWesk/

These scripts produce several files, but you'll want:
- Point layer of businesses: shp/buildings_damaged.geojson
- Polygon layer of buildings: shp/buildings_damaged_final.geojson
