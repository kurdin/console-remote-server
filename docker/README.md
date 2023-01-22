Open project path in Terminal and run below commands; Tested with MacPro M1.

- NAME = Docker image name
- TAG = Docker image tag, used package.json > version
```
export NAME=kick/console-remote-server
export TAG=2.1.17
# For local
docker build -f docker/Dockerfile -t ${NAME}:${TAG} --no-cache .
# For push
docker buildx build -f docker/Dockerfile -t ${NAME}:${TAG},${NAME}:latest --platform=linux/amd64--push .
```