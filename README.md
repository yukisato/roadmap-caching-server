# Caching Proxy Server

## Overview

This project is an implementation of a learning project featured on [roadmap.sh](https://roadmap.sh/projects/caching-server).

## Installation

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Run
cd ./bin
caching-proxy --port 3000 --origin https://jsonplaceholder.typicode.com
```

## Command examples

```bash
# Run the proxy server
caching-proxy --port 3000 --origin https://jsonplaceholder.typicode.com

# Clear the cache
caching-proxy --clear-cache

# First fetch and you'll see `X-Cache: MISS` response header
curl -I http://localhost:3000/posts/1

# Second fetch and you'll see `X-Cache: HIT` response header
curl -I http://localhost:3000/posts/1
```
