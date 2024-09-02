# Caching Proxy Server

## Overview

This project is an implementation of a learning project featured on [roadmap.sh](https://roadmap.sh/projects/caching-server).

## Installation

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Run the proxy server
cd ./bin
./caching-proxy --port 3000 --origin https://jsonplaceholder.typicode.com
```

## Command examples

```bash
# Go to the bin directory
cd ./bin

# Run the proxy server
./caching-proxy --port 3000 --origin https://jsonplaceholder.typicode.com

# First fetch and you'll see the `X-Cache: MISS` response header
curl -I http://localhost:3000/posts/1

# Second fetch and you'll see the `X-Cache: HIT` response header
curl -I http://localhost:3000/posts/1

# Clear the cache
./caching-proxy --clear-cache

# Thrid fetch and you'll see `X-Cache: MISS` response header again
curl -I http://localhost:3000/posts/1
```
