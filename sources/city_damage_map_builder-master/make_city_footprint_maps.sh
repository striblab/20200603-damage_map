echo "Downloading Minnesota building footprints ..." &&
wget https://usbuildingdata.blob.core.windows.net/usbuildings-v1-1/Minnesota.zip -O shp/Minnesota.zip
unzip -o shp/Minnesota.zip -d shp

echo "Clipping footprints to Hennepin County boundary ..." &&
mkdir shp/buildings_hennepin &&
mapshaper-xl shp/Minnesota.geojson -clip shp/hennepin_cty_boundary/hennepin_cty_boundary.shp -o shp/buildings_hennepin/buildings_hennepin.shp \

echo "Clipping footprints to Ramsey County boundary ..." &&
mkdir shp/buildings_ramsey &&
mapshaper-xl shp/Minnesota.geojson -clip shp/ramsey_cty_boundary/ramsey_cty_boundary.shp -o shp/buildings_ramsey/buildings_ramsey.shp \

echo "Combining county footprint files..." &&
mkdir shp/hennepin_ramsey_buildings
mapshaper -i shp/buildings_hennepin/buildings_hennepin.shp shp/buildings_ramsey/buildings_ramsey.shp combine-files \
	-merge-layers \
	-o shp/hennepin_ramsey_buildings/hennepin_ramsey_buildings.shp

echo "Making parcel IDs unique..." &&
echo "Hennepin..." &&
shp2json -n shp/hennepin_cty_parcel/hennepin_cty_parcel.shp | ndjson-map 'd.properties.pid_unique = d.properties.county[0] + d.properties.parcel_id, d' > shp/hennepin_cty_parcel/hennepin_cty_parcel_unique.geojson

echo "Ramsey..." &&
shp2json -n shp/ramsey_cty_parcel/ramsey_cty_parcel.shp | ndjson-map 'd.properties.pid_unique = d.properties.county[0] + d.properties.parcel_id, d' > shp/ramsey_cty_parcel/ramsey_cty_parcel_unique.geojson

echo "Combining county parcel files..." &&
mkdir shp/hennepin_ramsey_parcel
mapshaper -i shp/hennepin_cty_parcel/hennepin_cty_parcel_unique.geojson shp/ramsey_cty_parcel/ramsey_cty_parcel_unique.geojson combine-files \
	-merge-layers \
	-o shp/hennepin_ramsey_parcel/hennepin_ramsey_parcel.shp

echo "Joining parcel map attributes to building footprints ..." &&
mapshaper-xl shp/hennepin_ramsey_buildings/hennepin_ramsey_buildings.shp -join shp/hennepin_ramsey_parcel/hennepin_ramsey_parcel.shp -o shp/buildings_hennepin_ramsey_joined.shp \
