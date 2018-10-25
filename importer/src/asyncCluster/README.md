# AsynCluster Module



This module sets up _processLimit_ number of worker process each running
_asyncLimit_ tasks asynchronously.



This module makes use of two libraries:

*  **cluster** Present in node API, it is used to take advantage of multi-core
systems, launching a cluster of Node.js processes to handle the load.

*  **Async.js** It is a utility module which provides straight-forward, powerful
functions for working with asynchronous JavaScript.



## Architecture

A master process forks _processLimit_ number of worker process, each of which
run _asyncLimit_ number of _instanceFunction_ on a provided set of arguments.


![alt text](https://goo.gl/bvqZPL "Logo Title Text 1")


## API reference

An instance of this module can be started by passing the following the
parameters to the default export:
```javascript
export default function asyncCluster({
	asyncLimit: number,
	processLimit: number,
	clusterArgs: Array[?],
	workerInitFunction: function,
	instanceFunction: function,
	workerExitCallback: function,
	masterExitCallback: function
}){...}
```
  Details of the arguments are as follows:

1. **asyncLimit**: Maximum number of instances of _instanceFunction_ (see below)
running asynchronously in a worker process. This is a not a compulsory argument,
and if not provided defaults to a value of 4.
2. **processLimit**: Maximum Number of worker processes forked. This is a not a
compulsory argument and if not provided default to a value of number of CPUs in
the system.

3. **clusterArgs**: Arguments for the whole cluster.
	```javascript
	const clusterArgs = [...argsToBeProcessed]
	```

	* It is assumed that the provided _instanceFunction_ can process any of the
	provided _clusterArgs_.

	* The _clusterArgs_ are split into _parallelLimit_ chunks, called
	_workerArgs_.

	* The _asyncLimit_ number of _instanceFunction_ is then run against each
	_workerArgs_.

	* This is not a compulsory argument. In case not provided, _parallelLimit_
	number of default arguments are generated to run _parallelLimit_ number of
	workers.

	* In case of data import producers, _clusterArgs_ are usually the full path
	to each dump (something like `${path}/${no}.txt`) for _instanceFunction_ to
	read and process. In case of data import consumers, it is `null`, which
	would by default launch _parallelLimit_ number of consumers.

4. **workerInitFunction**: This function is called to carry out any form of
preprocessing required before the worker starts running _instanceFunctions_.
	```javascript
	function workerInitFunction(id:number) {...}
	```
	* It takes in _workerId_ as the numerical value as it's input.
	* The return value from the _workerInitFunction_ is appended to each
	_clusterArgs_ to be sent over to _instanceFunction_. The new full
	_instanceFunctionArgument_ is
	```json
	{
		init: valueFromInitFunction,
		id: workerId,
		base: theOriginalValueInTheClusterArgs
	}
	```
	* In case of both data import producer and consumers, the
	_workerInitFunction_ provides the _#connection_ object (to connect with the
	rmq). The _instanceFunctions_ then create _queue.channel_ to connect to the
	queue within each worker process.
	* Note that as creating _#connection_ is an expensive operation, it is
	necessary to create it once per process, and then create _#channel_ as and
	when needed in asynchronous tasks within the process. The
	_workerInitFunction_ provides the initial _#connection_ object.
	* Also, note that creating  _#connection_ object in the master process
	before forking the worker processes would not help, as soon as the first
	worker process exits, the _#connection_ object (a fd of the sorts) would be
	closed because of which the other workers as well as master would be unable
	to utilise the _#connection_ object.

5. **instanceFunction**: The base function to be run for each argument. It takes
in arguments in form of an object with _base_ key as one of the _clusterArgs_,
_id_ key as _workerId_ and _init_ key as _return value of init function_
( as explained above).
	```javascript
	function instanceFunction({id:number, init: ?, base: ?}) {...}
	```
	* It is assumed that the base functions return a `Promise` carrying the
	results computed after processing on the _workerArgs_.
	* In case of data import producers, _instanceFunction_ take in a file path,
	create a file IO stream and process the file.  They return the results in a
	`Promise`, which contains results fulfilled after completion of the
	processing. The worker process is terminated after fulfilment of the
	`Promise`.
	* In case of data import consumers, _instanceFunction_ fires _#consume_
	function, which is theoretically supposed to stay alive indefinitely (as
	long as the queue lives). As a result, the _instanceFunction_ returns a
	never fulfilling `Promise`, so that the _#consume_ function continues to
	listen for new arrivals. It is only terminated using something like
	`SIGINT` signal from keyboard (Ctrl+C).

6. **workerExitCallback**: This is called before a worker exits. It receives
the return value from each instance of _instanceFunction_ run against the
arguments received by the worker process. As a result, it receives an array
of `Promise`s for each argument received by the worker.
	```javascript
	function masterExitCallback(results:Array[?]) : Promise {...}
	```
	* The _workerExitCallback_ is expected to process the results received and
	return a `Promise`. It is usually intended to help the worker aggregate all
	the results received asynchronously in a meaningful manner.  The value
	returned promise when fulfilled is sent over to the master process.
	* Note that as master and worker process communicate via IPC, it is not
	possible to send over `Promises`. Hence the _workerExitCallback_ is expected
	to return a promise, value from which when fulfilled is sent to the master
	process.
	* Upon the completion of message passing to the master process, the worker
	process is killed with `SIGHUP` signal.
7. **masterExitCallback**: This is called before master process exits (after all
the workers have exited). The _masterExitCallback_ receives an array containing
the results received from each worker process.
	```javascript
	function masterExitCallback(results:Array[?]){...}
	```
	* It is primarily intended to aggregate results from worker processes.
	* As master and worker processes communicate using IPC, `Promises` etc.
	cannot be passed around. Due to this, all results passed to
	masterExitCallback are absolute values and can be used to carry out any
	task before the master process exists.
