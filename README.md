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
grafana-cli --debug --pluginUrl=https://github.com/NGI-Digital/ngilive-map/releases/download/v0.2/ngilive-map-0.2.zip plugins install ngilive-map 
```


Set up Grafana environment locally 
```
docker volume create grafana-storage
docker run -d -e "GF_PATHS_PLUGINS=/opt/grafana-plugins" -v grafana-storage=/var/lib/grafana -v <path to plugin folder>/dist:/opt/grafana-plugins -p 3000:3000 grafana/grafana

docker run -d --name=grafanabeta66 -e "GF_PATHS_PLUGINS=/opt/grafana-plugins" -v grafana-storage=/var/lib/grafana -v C:\Utvikling\github\ngilive-map\dist:/opt/grafana-plugins -p 3000:3000 grafana/grafana:6.6.0-beta1