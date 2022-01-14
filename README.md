# Etherium audit

Rest API for auditing Ethereum transactions

## Run application

```bash
# Clone repo
$ git clone git@github.com:mdwitr0/etherium-audit.git

# Open repo directory
$ cd etherium-audit

# Create environment file
$ cp example.env .env
```

Get api key in https://etherscan.io/myapikey and specify in the file .env the `ETHERSCAN_API_KEY` variable

```bash
# Start application containers
$ make up
```

## Endpoints

`/address/most-changed` - Get the address that has changed the most in the last 100 blocks

## App commands

### Installation

```bash
$ npm install
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Make commands

### Container management

```bash
# Start containers
$ make up

# Stop containers
$ make stop

# Build containers w/o cache
$ make rebuild

# Restart containers
$ make restart

# Remove containers
$ make down

# Show status of containers
$ make status
```

### Connecting to containers

```bash
# Run bash console for app container
$ make console-app

# run bash console for redis container
$ make console-redis
```

### Viewing logs

```bash
# Show all logs
$ make logs

# Show app logs
$ make logs-app

# Show redis logs
$ make logs-redis
```
