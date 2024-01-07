export class PromiseJob {
    protected workers = new Set<() => Promise<unknown>>();
    protected activeWorkers = 0;
    protected donePromise: Promise<void>;
    protected donePromiseResolve!: () => void;
    constructor(protected params: {maxParallel: number}) {
        this.donePromise = new Promise((resolve) => {
            this.donePromiseResolve = resolve;
        });
    }
    add(worker: () => Promise<unknown>) {
        this.workers.add(worker);
    }
    protected runNext() {
        this.activeWorkers--;
        if (this.activeWorkers === 0 && this.workers.size === 0) {
            this.donePromiseResolve();
        }
        if (this.activeWorkers < this.params.maxParallel) {
            this.runJob();
        }
    }
    protected runJob() {
        if (this.workers.size === 0) {
            return;
        }
        const firstJob = this.workers.values().next().value as () => Promise<unknown>;
        this.workers.delete(firstJob);
        this.activeWorkers++;
        try {
            firstJob().finally(() => {
                this.runNext();
            });
        } catch (err) {
            console.error(err);
            this.runNext();
        }
    }
    async run() {
        if (this.workers.size === 0) {
            this.donePromiseResolve();
        } else {
            for (let i = 0; i < this.params.maxParallel; i++) {
                this.runJob();
            }
        }
        await this.donePromise;
    }
}
