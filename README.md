# parallel-jobs

A small utility for running functions in parallel with limiting running jobs.

## Install
```
npm i parallel-jobs
```

## Usage
```
import {runParallel} from 'parallel-jobs';

console.log(await runParallel([
   async () => 1, 
   async () => 2, 
   async () => 3
], {limit: 2})) // [1, 2, 3]
```

if some async function will throw error `runParallel` will also throw