# komga-cbx

This application uses the non-free version of 7z to decompress rar5 files that komga does not support.

It will check every hour if there are files that are not supported by komga and convert them to cbz format in the same directory where they are.
It is necessary to specify a backup folder where the rar files will be saved

## Usage
**Docker is needed.**
Note: **The volumes path must be the same configured in komga**

Just modify your docker-compose.yml:

```
---
version: "3.1"
services:
  komga-cbx:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - KOMGA=http://localhost:8080
        - USERNAME=yourmail@mail.com
        - PASSWORD=123456
        - BACKUP=/comics/backup #rar5 files will be moved to this folder
    container_name: komga-cbx
    environment:
      - PUID=1000
      - PGID=1000
      - UMASK=022
    volumes:
      - .:/app
      - /your/comics/directory:/comics #should be the same path configured in komga
    ports:
      - 8787:3000
    restart: unless-stopped

```

Run docker compose:

```
docker-compose up --build
```
