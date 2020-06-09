echo "Downloading damage spreadsheet ..."
wget https://docs.google.com/spreadsheets/d/1yxbb7aamQw6ePRB17nEKCLxIIJbvdFYmS-GEOTCWesk/export?format=csv -O shp/buildings_damaged.csv

echo "Cleaning up col names ..."
sed 's/ (right click in Google Maps to find this if you can)//g' shp/buildings_damaged.csv | \
  sed 's/Business name/business_name/g' | \
  sed 's/Street address/address/g' | \
  sed 's/Short description\/severity of damage/damage_desc/g' | \
  sed 's/Would you say this is an ""essential"" business?/bool_essential/g' | \
  sed 's/Date of main damage (roughly)/damage_date/g' | \
  sed 's/Estimate of time of day damage occurred?/damage_time_of_day/g' > shp/buildings_damaged_cleaner.csv

echo "Convert to ndjson..."
csv2geojson --lat Latitude --lon Longitude shp/buildings_damaged_cleaner.csv | \
  ndjson-cat > shp/buildings_damaged.geojson

# Version 1: direct to buildings...
echo "Join with buildings..."
mapshaper-xl shp/buildings_hennepin_ramsey_joined.shp -join shp/buildings_damaged.geojson -o shp/buildings_joined_all.geojson

# Version 2: through parcels first, but causes problems when buildings cross parcels
# echo "Join with parcels..."
# mapshaper-xl shp/buildings_damaged.geojson -join shp/hennepin_ramsey_parcel/hennepin_ramsey_parcel.shp -o shp/buildings_damaged_joined.geojson
# echo "Joining buildings to damaged buildings..."
# mkdir shp/buildings_joined_all
# mapshaper-xl shp/buildings_hennepin_ramsey_joined.shp -join shp/buildings_damaged_joined.geojson keys=pid_unique,pid_unique -o shp/buildings_joined_all.geojson

echo "Filtering for only damaged buildings..."
mapshaper-xl shp/buildings_joined_all.geojson -filter 'business_name!=null && parcel_id.indexOf(" RoW") == -1' -o shp/buildings_damaged_final.geojson

echo "Join business with buildings the other way to find non-matches..."
mapshaper-xl shp/buildings_damaged.geojson -join shp/buildings_hennepin_ramsey_joined.shp -filter 'parcel_id==null' -o shp/businesses_no_building.geojson

echo "List of businesses with no building match..."
ndjson-cat shp/businesses_no_building.geojson | jq -r '.features[].properties.business_name' > no_matches.txt
