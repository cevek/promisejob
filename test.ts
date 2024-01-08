import {runParallel} from './index';

test('empty input', async () => {
    expect(await runParallel([], {limit: 2})).toStrictEqual([]);
});
test('1 parallel', async () => {
    await testJobs(1);
});
test('2 parallel', async () => {
    await testJobs(2);
});
test('3 parallel', async () => {
    await testJobs(3);
});
test('4 parallel', async () => {
    await testJobs(4);
});
test('20 parallel', async () => {
    await testJobs(20);
});
test('fail', async () => {
    let runned = 0;
    const jobs = [];
    for (let i = 0; i < 10; i++) {
        jobs.push(async () => {
            runned++;
            if (i >= 5) throw new Error('err' + i);
            await sleep();
            return i;
        });
    }
    try {
        await runParallel(jobs, {limit: 2});
        expect(true).toBe(false);
    } catch (err) {
        expect((err as Error).message).toBe('err5');
    }
    expect(runned).toBeLessThan(8);
});

async function testJobs(maxParallel: number) {
    const order: number[] = [];
    let active = 0;
    let maxActive = 0;
    const jobs = [];
    for (let i = 0; i < 10; i++) {
        jobs.push(async () => {
            active++;
            maxActive = Math.max(maxActive, active);
            order.push(i);
            await sleep();
            active--;
            return i;
        });
    }
    expect(await runParallel(jobs, {limit: maxParallel})).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(order).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(maxActive).toStrictEqual(Math.min(10, maxParallel));
}

function sleep() {
    return new Promise((r) => setTimeout(r, Math.random() * 100));
}
