'use strict';

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require('../expressError');
const Job = require('./job.js');
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
} = require('./_testCommon');

let testJobsIds;

beforeAll(async function () {
	testJobsIds = await commonBeforeAll();
});
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe('create', function () {
	const newJob = {
		title: 'Test Job',
		salary: 10000,
		equity: '0.1',
		companyHandle: 'c1',
	};

	test('works', async function () {
		let job = await Job.create(newJob);
		expect(job).toEqual({
			...newJob,
			id: expect.any(Number),
		});
	});
});

/************************************** findAll */

describe('findAll', function () {
	test('works: no filter', async function () {
		let jobs = await Job.findAll();
		expect(jobs).toEqual([
			{
				id: testJobsIds[0],
				title: 'j1',
				salary: 1000,
				equity: '0.0',
				companyHandle: 'c1',
				companyName: 'C1',
			},
			{
				id: testJobsIds[1],
				title: 'j2',
				salary: 2000,
				equity: '0.2',
				companyHandle: 'c2',
				companyName: 'C2',
			},
			{
				id: testJobsIds[2],
				title: 'j3',
				salary: 3000,
				equity: '0.3',
				companyHandle: 'c3',
				companyName: 'C3',
			},
		]);
	});

	test('works: filter by name', async function () {
		let jobs = await Job.findAll({ title: 'j1' });
		expect(jobs).toEqual([
			{
				id: testJobsIds[0],
				title: 'j1',
				salary: 1000,
				equity: '0.0',
				companyHandle: 'c1',
				companyName: 'C1',
			},
		]);
	});

	test('works: filter by minSalary', async function () {
		let jobs = await Job.findAll({ minSalary: 2500 });
		expect(jobs).toEqual([
			{
				id: testJobsIds[2],
				title: 'j3',
				salary: 3000,
				equity: '0.3',
				companyHandle: 'c3',
				companyName: 'C3',
			},
		]);
	});

	test('works: filter by hasEquity', async function () {
		let jobs = await Job.findAll({ hasEquity: true });
		expect(jobs).toEqual([
			{
				id: testJobsIds[1],
				title: 'j2',
				salary: 2000,
				equity: '0.2',
				companyHandle: 'c2',
				companyName: 'C2',
			},
			{
				id:
					testJobsIds[2],
				title: 'j3',
				salary: 3000,
				equity: '0.3',
				companyHandle: 'c3',
				companyName: 'C3',
			},
		]);
	});

	test('works: filter by all', async function () {
		let jobs = await Job.findAll({
			title: 'j',
			minSalary: 1500,
			hasEquity: true,
		});
		expect(jobs).toEqual([
			{
        id: testJobsIds[1],
        title: 'j2',
        salary: 2000,
        equity: '0.2',
        companyHandle: 'c2',
        companyName: 'C2'
      },
			{
				id: testJobsIds[2],
				title: 'j3',
				salary: 3000,
				equity: '0.3',
				companyHandle: 'c3',
				companyName: 'C3',
			},
		]);
	});
});

/************************************** get */

describe('get', function () {
	test('works', async function () {
		let job = await Job.get(testJobsIds[0]);
		expect(job).toEqual({
			id: testJobsIds[0],
			title: 'j1',
			salary: 1000,
			equity: '0.0',
			company: {
				companyHandle: 'c1',
				name: 'C1',
				numEmployees: 1,
				description: 'Desc1',
				logoUrl: 'http://c1.img',
			},
		});
	});

	test('not found if no such job', async function () {
		try {
			await Job.get(999);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe('update', function () {
  test('works', async function () {
    const updateData = {
      title: 'New',
      salary: 50000,
      equity: '0.5',
    };

    let job = await Job.update(testJobsIds[0], updateData);
    expect(job).toEqual({
      id: testJobsIds[0],
      companyHandle: 'c1',
      ...updateData,
    });
  });

  test('not found if no such job', async function () {
    try {
      await Job.update(999, {
        title: 'test',
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe('remove', function () {
  test('works', async function () {
    await Job.remove(testJobsIds[0]);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=$1", [testJobsIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test('not found if no such job', async function () {
    try {
      await Job.remove(999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
}
);
