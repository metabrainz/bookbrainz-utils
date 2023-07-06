# bookbrainz-import

The producer and consumer applications handling data imports for BookBrainz

## Development Setup

### TypeScript Runtime

Since most of the code is written in TypeScript, you can not directly run it with Node.js and you have to use either a transpiler or a TS runtime.

The Babel transpilation process (from TS to JS) is currently broken because it keeps `.ts` module extensions in import statements as-is.
Using `babel-node` or `ts-node` is currently not possible (for the same reason) because ESM causes additional problems under Node.js v20.

Therefore it is recommended to directly run the code with [Deno](https://deno.land), which supports TS out of the box.

### RabbitMQ Server

In order to store parsed entities that still have to be imported into the BookBrainz database, we are using a message queue.

Create and run a Docker container with a RabbitMQ server and expose the relevant ports locally:

```sh
docker run --hostname rabbit --name rabbit-mq -p 127.0.0.1:5672:5672 -p 127.0.0.1:15672:15672 rabbitmq:3
```

Stop the container:

```sh
docker stop rabbit-mq
```

Restart the container:

```sh
docker start rabbit-mq
```

## OpenLibrary Producer

Before you can start importing OpenLibrary dumps, you need a running RabbitMQ server.

As the producer script operates on plaintext files, you have to unzip the downloaded dump file first.
For testing purposes you can also extract a short sample with e.g. `head dump.txt > sample.txt`.

Run the producer script with the `--help` flag to learn about the options which the CLI accepts:

```sh
cd src/openLibrary/
deno run -A import.ts --help
```
