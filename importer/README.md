# bookbrainz-import

The producer and consumer applications handling data imports for BookBrainz

## BookBrainz Import Queue (BBIQ) Management

Each producer application of the BookBrainz importer project inserts parsed entities into an import queue.
In order to actually insert queued entities into the BookBrainz database, you have to start a consumer service.

The consumer service requires that both the RabbitMQ server with the import queue and the PostgreSQL server with the BB database are available.
You also have to create a configuration file `config/config.json` ([template](config/config.json.sample)) which specifies the database connection before you can start.

Run the [BBIQ application](src/bbiq.ts) with the `--help` flag to learn about the commands and options which the CLI accepts:

```sh
deno task bbiq --help
```

Await and consume queued entities from the default queue:

```sh
deno task bbiq consume
```

## OpenLibrary Producer

Before you can start importing OpenLibrary dumps, you need a running RabbitMQ server.

As the producer script operates on plaintext files, you have to unzip the downloaded dump file first.
For testing purposes you can also extract a short sample with e.g. `head dump.txt > sample.txt`.

Run the [producer script](src/openLibrary/import.ts) with the `--help` flag to learn about the options which the CLI accepts:

```sh
deno task ol --help
```

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
docker run -d --hostname rabbit --name rabbit-mq -p 127.0.0.1:5672:5672 -p 127.0.0.1:15672:15672 rabbitmq:3-management
```

Stop the container:

```sh
docker stop rabbit-mq
```

Restart the container:

```sh
docker start rabbit-mq
```

### Minimal Database for Import Tests

If you don't want to use your full development database to test the unstable importer project, you can create a separate test database.

The regular test database, which is used for unit tests, is not sufficient since important supplementary tables (such as `musicbrainz.language`) are empty.
This would lead to foreign key constraint violations, so you have to create a database which contains minimal data.

Assuming that you have appropriate dump files for a minimal database (plus empty import tables), copy them into the container and launch a shell for the container:

```sh
docker cp local/minimal_test_database.sql postgres:/minimal_test_database.sql
docker cp local/minimal_test_database_import_patch.sql postgres:/minimal_test_database_import_patch.sql
docker exec -it postgres bash
```

Inside the container you can create the database and execute the SQL files to seed it:

```sh
psql -c "CREATE DATABASE bookbrainz_min;" -U bookbrainz
psql -f minimal_test_database.sql -d bookbrainz_min -U bookbrainz
psql -f minimal_test_database_import_patch.sql -d bookbrainz_min -U bookbrainz
```

Do not forget to change the target database to `bookbrainz_min` in your `config/config.json` file.
