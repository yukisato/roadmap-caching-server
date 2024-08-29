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

## TODO (along with TDD)

- [ ] The caching proxy server starts listening on the specified port
  - [ ] When the path in the requested URL is in the cache, return the cache
    - [ ] it returns the cached response
    - [ ] it returns the header `X-Cache: HIT`
  - [ ] When the path in the requested URL is not in the cache, fetch and returnd the fresh data from the URL
    - [ ] it returns the fresh response
    - [ ] it returns the header `X-Cache: HIT`
- [ ] If the response is from the origin server, response with the header `X-Cache: MISS`
- [ ]
- [ ] Accept `--clear-cache` optional argument
- [ ] Create ./bin/caching-proxy to run the command

### Testability is high, importance is high

- [ ] `run()` starts the proxy server or clear the cache depending on the command line arguments
  - [ ] it starts the proxycvzz server when `--port` and `--origin` options are passed
  - [ ] it clears the cache when the `--clear-cache` option is passed
- [ ] `retrieveUrl()` fetches the given URL and return the response

  - [ ] when the path in the URL is in the cache, return the cache
  - [ ] when the path in the URL is not in the cache, it fetches and returns the fresh data from the URL

- [x] `connect()` connects to the DB
  - [x] it returns the same instance when it is called twice because it is a singleton
- [x] `initDb()` creates tables
  - [x] it creates a cache table
- [x] `getCache()` gets the cache for the given path
  - [x] when there is a record with the provided path in the DB
    - [x] it returns the cache when the path is in the cache
  - [x] when there is no record that matches the provided path in the DB
    - [x] it returns `null` when the path is not in the cache
- [x] `storeCache()` stores the data in the DB

  - [x] it stores the data in the DB

- [x] `clearCache()` deletes the cache data records in the DB

  - [x] it deletes all the data in the cache table in the database

- [ ] Display errors when the request failed

  - [ ] Firstly checks if the path in the requested URL is already in the cache
  - [ ] it stores the cache in the database when the request is successful

- [x] Retrieve parameters from the command line
  - [x] Accept `--port` optional argument default to `3000`
  - [x] Accept `--origin` required argument
  - [x] Accept `--clear-cache` optional argument

## Testability is low, importance is low

- [ ] The proxy server prints meaningful messages
  - [ ] it prints the starting message
  - [ ] it prints the error message when the request fails
- [ ] The proxy server returns the response with the proper cache header

  - [ ] it adds the header `X-Cache: HIT` when the path in the URL is in the cache
  - [ ] it adds the header `X-Cache: MISS` when the path in the URL is NOT in the cache

- [ ] print the response
