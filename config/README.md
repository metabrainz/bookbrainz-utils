# Config file settings

Rename the config.json.sample to config.json, and fill out the details.

A legend of the relevant config details available presently are as follows:

* **path** Path to the folder containing the dump files.
* **fileCount** Number of files to expect in the folder. By default, for ease of usage and increased automation, it is assumed that the data dump files inside the folder are ordered numerically from 1 to _fileCount_. However, one can ignore this setting, and fill out the file names manually in the code themselves.
* **parallelLimit** Number of subprocesses to be forked by the master process.
* **asyncLimit** Number of async tasks to be run by each child worker process. Node is by default single threaded, and offloads the async tasks to the kernel. The _asyncLimit_ specifies the maximum number of tasks that node worker process sets up to be run asynchronously. Note that as tasks can be less than the specified limit, it is a cap on the maximum value.