# Map plugin for Grafana based on Leaflet

Used for visualizing data from IoT sensors in a map view.

Run the plugin in development

```
npm install
yarn watch
```

This will run linting tools and apply prettier fix.

Build for production

```
yarn build
```

Create a zip file containing the ngilive-map folder ( the root folder of the zip file has to be ngilive-map ) except from .git, releases and node modules.
For some reason the grafana installer seems to be failing when using "send to compressed folder" in Windows, so another tool like 7zip is recommended.

Publish the new zip file as a release on Github.

Test released version in local Docker

```
grafana-cli --debug --pluginUrl=https://github.com/NGI-Digital/ngilive-map/releases/download/v<xx.yy>/ngilive-map-<xx.yy>.zip plugins install ngilive-map
```

Set up Grafana environment locally

```
docker volume create grafana-storage
docker run -d -e "GF_PATHS_PLUGINS=/opt/grafana-plugins" -v grafana-storage=/var/lib/grafana -v <path to plugin folder>/dist:/opt/grafana-plugins -p 3000:3000 grafana/grafana

#p500-hcs
docker run -d --name=grafanabeta66 -e "GF_PATHS_PLUGINS=/opt/grafana-plugins" -v grafana-storage-beta=/var/lib/grafana -v C:\Utvikling\ngilive-map\dist:/opt/grafana-plugins -p 3001:3000 grafana/grafana:6.6.0-beta1

## Working queries
Query A
SELECT  i.instrument_name, i.instrument_id, c.xpos, c.ypos, c.coordinate_system, s.sample_type as unit, max(s.CORR_VALUE) as max, min(s.CORR_VALUE) as min, round(avg(s.CORR_VALUE),2) as avg, i.type as instrument_type, i.area from instrument i
inner join COORDINATES c on c.COORDINATE_ID = i.COORDINATE_ID
inner join sample s on s.INSTRUMENT_ID = i.INSTRUMENT_ID
where  (s.sample_type = $sampleType) AND
  (i.copy_to_gis = 1) AND
  (i.type = $instrumentType) AND
  (i.area = $instrumentArea) AND
  (s.instrument_id = $instrument) AND
  ($instrumentGroup = '__ALL__' OR i.instrument_name LIKE $instrumentGroup+'%') AND
  $__timeFilter(sample_date)
group by i.instrument_id , i.instrument_name, c.xpos, c.ypos, c.coordinate_system, s.sample_type, i.type, i.area

Query B
(select s.instrument_id, s.corr_value as last_value,s.SAMPLE_DATE from sample s
     where s.SAMPLE_DATE=(select max(ss.SAMPLE_DATE) from sample ss where ss.INSTRUMENT_ID = s.INSTRUMENT_ID and $__timeFilter(ss.sample_date)))
```
