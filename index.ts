export async function runParallel<T extends (() => Promise<unknown>)[] | []>(
    jobs: T,
    params: {limit: number},
): Promise<{[P in keyof T]: Awaited<ReturnType<T[P]>>}> {
    type Res = {[P in keyof T]: Awaited<ReturnType<T[P]>>};
    const result = [] as Res;
    let activeWorkers = 0;
    let currentIdx = 0;
    let resolvePromise!: (v: Res) => void;
    let rejectPromise!: (err: unknown) => void;
    let rejected = false;
    const promise = new Promise<Res>((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });
    function finishJob(jobIndex: number, value: unknown) {
        if (rejected) return;
        result[jobIndex] = value;
        activeWorkers--;
        if (activeWorkers === 0 && jobs.length === currentIdx) {
            resolvePromise(result);
        }
        if (activeWorkers < params.limit) {
            runJob();
        }
    }
    function runJob() {
        if (currentIdx === jobs.length || rejected) {
            return;
        }
        const jobIndex = currentIdx;
        currentIdx++;
        const job = jobs[jobIndex];
        activeWorkers++;
        job().then(
            (v) => finishJob(jobIndex, v),
            (err) => {
                rejected = true;
                rejectPromise(err);
            },
        );
    }
    if (jobs.length === 0) {
        resolvePromise(result);
    } else {
        for (let i = 0; i < Math.min(jobs.length, params.limit); i++) {
            runJob();
        }
    }
    return await promise;
}
