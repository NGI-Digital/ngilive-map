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

Set up Grafana environment locally 
```
docker volume create grafana-storage
docker run -d -e "GF_PATHS_PLUGINS=/opt/grafana-plugins" -v grafana-storage=/var/lib/grafana -v <path to plugin folder>/dist:/opt/grafana-plugins -p 3000:3000 grafana/grafana
