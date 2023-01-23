Open project path in Terminal and run below commands. Tested with Macbook Pro M1.

```
# build for local
docker build -f docker/Dockerfile -t yavuzslmtpl/console-remote-server:2.1.17 --no-cache .

# build for push
docker buildx build -f docker/Dockerfile -t yavuzslmtpl/console-remote-server:2.1.17,yavuzslmtpl/console-remote-server:latest --platform=linux/amd64,linux/arm64 --push .

# run docker on port 80 to be available for Console Remote Web App to connect 
docker run -p 80:80 -d yavuzslmtpl/console-remote-server:2.1.17
```

Now you need to run Console Remote Web App in production mode to be able to connect to port 80 on docker
`NODE_ENV=production gulp`

Or build the app for production
`npm run build`

If you run docker in the cloud, and want to run Console Remote Web App on local or another domain, you must change `APP_CONNECT_HOST` in `.env.production` file to point to the host of your docker, you should provide a full url with something like `APP_CONNECT_HOST=https://myconsole.mydomain.com` and make sure the docker runs on this domain on port 80. You can check if docker runs by making request to https://myconsole.mydomain.com/socket.io/?EIO=4&transport=polling in your browser (or using cURL). You should have response `0{"sid":"tWBASoq2G5tkc80LAAAL","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":5000}` or simular.
