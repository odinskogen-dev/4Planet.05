# GEOGRAPHY, SOURCES, LICENSING & RIGHTS CHECKLIST
This is a provenance ledger and review prompt, NOT legal certification for every upstream asset.

CURRENTLY IN THIS ZIP:
public/land.geojson and public/rivers.geojson — source-derived Natural Earth 110m modern global physical geometry. Land and rivers are generalized; NOT reliable local historical river courses.
src/geo-tiles.js fetches remote 2016 EOxCloudless satellite tiles and Mapzen Terrain Tiles AWS Terrarium data. It does NOT contain downloaded copies of remote raster tiles.
src/map-art.js draws original approximate mountains and fields programmatically, not real digital elevation mesh.

## EOxCloudless by EOX IT Services GmbH
Source https://cloudless.eox.at/documentation/faq and https://cloudless.eox.at/pricing
2016 vintage: CC BY 4.0, allowed commercial use with credit, but public tile endpoint offers NO uptime agreement and fair-use/traffic constraints. 2018 onwards: generally noncommercial public rights or licensed commercial product, so DO NOT accidentally replace 2016 with 2018+ tiles. The required attribution should name EOxCloudless by EOX IT Services GmbH and modified Copernicus Sentinel data with relevant year. Credits must appear in-game and embedded in exported images/video as required. An unverified satellite tile URL is not the same as a guaranteed service.

## Mapzen Terrain Tiles (AWS Open Data)
https://registry.opendata.aws/terrain-tiles/
https://github.com/tilezen/joerd/blob/master/docs/attribution.md
https://github.com/tilezen/joerd/blob/master/docs/data-sources.md
https://github.com/tilezen/joerd/blob/master/docs/formats.md
Current renderer fetches https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png and decodes height in metres from RGB. Data aggregate SRTM and multiple regional elevation sources; Europe may include Copernicus EU-DEM. Source-specific attribution and rights vary; inspect the attribution doc and precise geographic source before commercial publishing. The prototype's generic 'Mapzen / EU-DEM' footer is INSUFFICIENT for a production global terrain-credit implementation.

## Natural Earth
https://www.naturalearthdata.com/about/terms-of-use/
Public domain. Global 110m physical geometry is useful at broad zoom only. The two files here are in geographic WGS84 GeoJSON suitable for source review. Do not silently portray outlines or shorelines as exact ancient ones.

## Pleiades ancient places
https://pleiades.stoa.org/downloads
CC BY 3.0 released data; useful for names, site identity, locations and temporal confidence. Not yet integrated into the programmatic map.

## Itiner-e ancient roads
https://itiner-e.org/about
https://doi.org/10.1038/s41597-025-06140-z
https://doi.org/10.5281/zenodo.17122148
CC BY 4.0 per project about page; around 14,769 published Roman road segments in 2025 paper. Source has road-category and uncertainty metadata. Modern digital reconstruction of road system across Roman centuries, NOT a certified map of roads already built in 216 BCE. Date-filter and cross-check route segments before use. The current roads array is only 10 straight schematic links and has no Itiner-e ingestion.

## Required future data path
1. Historic sites as stable place IDs/aliases, approx bounding coordinates and evidence dates.
2. DEM tiled/prefetched region-specific data to a Three.js (or your chosen engine) adaptive mesh with bounded tile budget; physical heights, normals, ridgelines, watersheds.
3. Ancient road and river polylines validated for selected start date; navigability/army speed depends on slope, water crossing, season, road status and supply.
4. Archaeologically supported, period-specific settlement silhouettes and footprints where evidence exists; no Google imagery redistribution, copyrighted texture rip or unknown 3D assets.
5. Source ledger: dataset name, provider, URL, version/vintage, licence, attribution, modification, included files, commercial compatibility and region-specific obligations.

Do not redistribute 2018+ satellite imagery without commercial rights. No new purchase is approved.
