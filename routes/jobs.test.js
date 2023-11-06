"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  a1Token
} = require("./_testCommon");

let testJobsIds;

beforeAll(async function () {
  testJobsIds = await commonBeforeAll();
});
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 100,
    equity: "0.1",
    companyHandle: "c1"
  };

  test("ok for admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${a1Token}`); 
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {...newJob, id: expect.any(Number)}
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob);  
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("GET /jobs", function () {
  test("works for anon: no filters", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobsIds[0],
          title: "j1",
          salary: 1000,
          equity: "0.0",
          companyHandle: "c1",
          companyName: "C1"
        },
        {
          id: testJobsIds[1],
          title: "j2",
          salary: 2000,
          equity: "0.2",
          companyHandle: "c2",
          companyName: "C2"
        },
        {
          id: testJobsIds[2],
          title: "j3",
          salary: 3000,
          equity: "0.3",
          companyHandle: "c3",
          companyName: "C3"
        }
      ]
    });
  });

  test("works: filtering on title", async function () {
    const resp = await request(app).get("/jobs?title=j1");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobsIds[0],
          title: "j1",
          salary: 1000,
          equity: "0.0",
          companyHandle: "c1",
          companyName: "C1"
        }
      ]
    });
  });

  test("works: filtering on minSalary", async function () {
    const resp = await request(app).get("/jobs?minSalary=2000");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobsIds[1],
          title: "j2",
          salary: 2000,
          equity: "0.2",
          companyHandle: "c2",
          companyName: "C2"
        },
        {
          id: testJobsIds[2],
          title: "j3",
          salary: 3000,
          equity: "0.3",
          companyHandle: "c3",
          companyName: "C3"
        }
      ]
    });
  });

  test("works: filtering on hasEquity", async function () {
    const resp = await request(app).get("/jobs?hasEquity=true");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobsIds[1],
          title: "j2",
          salary: 2000,
          equity: "0.2",
          companyHandle: "c2",
          companyName: "C2"
        },
        {
          id: testJobsIds[2],
          title: "j3",
          salary: 3000,
          equity: "0.3",
          companyHandle: "c3",
          companyName: "C3"
        }
      ]
    });
  });

  test("works: all filters at once", async function () {
    const resp = await request(app).get("/jobs?title=j&minSalary=2000&hasEquity=true");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobsIds[1],
          title: "j2",
          salary: 2000,
          equity: "0.2",
          companyHandle: "c2",
          companyName: "C2"
        },
        {
          id: testJobsIds[2],
          title: "j3",
          salary: 3000,
          equity: "0.3",
          companyHandle: "c3",
          companyName: "C3"
        }
      ]
    });
  });

  test("bad request if invalid filter key", async function () {
    const resp = await request(app).get("/jobs?nope=nope");
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid minSalary", async function () {
    const resp = await request(app).get("/jobs?minSalary=not-a-number");
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${testJobsIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobsIds[0],
        title: "j1",
        salary: 1000,
        equity: "0.0",
        company: {
          "companyHandle": "c1",
          "description": "Desc1",
          "logoUrl": "http://c1.img",
          "name": "C1",
          "numEmployees": 1
        }
      }
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobsIds[0]}`)
        .send({
          title: "j1-new",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobsIds[0],
        title: "j1-new",
        salary: 1000,
        equity: "0.0",
        companyHandle: "c1"
      }
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobsIds[0]}`)
        .send({
          title: "j1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobsIds[0]}`)
        .send({
          title: "j1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobsIds[0]}`)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({ deleted: `${testJobsIds[0]}` });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobsIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobsIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});