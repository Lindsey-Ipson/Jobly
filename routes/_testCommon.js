"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM jobs");

  await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });
  await Company.create(
      {
        handle: "c4",
        name: "C4",
        numEmployees: 4,
        description: "Desc4",
        logoUrl: "http://c4.img",
      });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  await User.register({
    username: "a1",
    firstName: "A1F",
    lastName: "A1L",
    email: "admin1@user.com",
    password: "password1",
    isAdmin: true,
  });

  const testJob1Res = await Job.create({
    title: "j1",
    salary: 1000,
    equity: "0.0",
    companyHandle: "c1",
  });
  const testJob2Res = await Job.create({
    title: "j2",
    salary: 2000,
    equity: "0.2",
    companyHandle: "c2",
  });
  const testJob3Res = await Job.create({
    title: "j3",
    salary: 3000,
    equity: "0.3",
    companyHandle: "c3",
  });

  await User.apply("u1", testJob1Res.id);
  await User.apply("u1", testJob2Res.id);
  await User.apply("u2", testJob1Res.id);

  return [testJob1Res.id, testJob2Res.id, testJob3Res.id];
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const a1Token = createToken({ username: "a1", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  a1Token
};