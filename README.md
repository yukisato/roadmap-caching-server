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
  - [ ] When the requested URI is in the cache, return the cache
    - [ ] it returns the cached response
    - [ ] it returns the header `X-Cache: HIT`
  - [ ] When the requested URI is not in the cache, fetch and returnd the fresh data from the URI
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
- [ ] `retrieveURI()` fetches the URI and return the response

  - [ ] when the URI is in the cache, return the cache
  - [ ] when the URI is not in the cache, it fetches and returns the fresh data from the URI

- [x] `connect()` connects to the DB
  - [x] it returns the same instance when it is called twice because it is a singleton
- [ ] `getCache()` gets the cache for the given URI
  - [ ] it returns the cache when the URI is in the cache
  - [ ] it returns `null` when the URI is not in the cache
- [ ] `storeCache()` stores the data in the cache database

  - [ ] it stores the data in the cache database

- [ ] `clearCache()` clears the data in the cache database

- [ ] Display errors when the request failed

  - [ ] Firstly checks if the requested URI is already in the cache
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

  - [ ] it adds the header `X-Cache: HIT` when the URI is in the cache
  - [ ] it adds the header `X-Cache: MISS` when the URI is NOT in the cache

- [ ] print the response
