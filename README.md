# promisejob

A small utility for running promises in parallel with limiting running jobs.

## Install
```
npm i promisejob
```

## Usage
```
const promiseJob = new PromiseJob({maxParallel: 10});
// add some jobs
promiseJob.add(async () => {
   await fetch(...)
})
await promiseJob.run();
// all jobs are finished
```