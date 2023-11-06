const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works with 1 item being updated", function () {
    const result = sqlForPartialUpdate(
      { columnOne: "data_one_edited" },
      { columnOne: "column_one", 
        columnTwo: "column_two" }
      );
    expect(result).toEqual({
      setCols: "\"column_one\"=$1",
      values: ["data_one_edited"],
    });
  });

  test("works with multiple item being updated", function () {
    const result = sqlForPartialUpdate(
      { columnOne: "data_one_edited", columnTwo: "data_two_edited" },
      { columnOne: "column_one", columnTwo: "column_two" }
      );
    expect(result).toEqual({
      setCols: "\"column_one\"=$1, \"column_two\"=$2",
      values: ["data_one_edited", "data_two_edited"],
    });
  });

  test("throws error if no data", function () {
    expect.assertions(1);
    try {
      sqlForPartialUpdate({}, {});
    } catch (err) {
      expect(err.message).toEqual("No data");
    }
  });

  test("throws error if data is not an object", function () {
    try {
      sqlForPartialUpdate("not an object", {});
    } catch (err) {
      expect(err.message).toEqual("No data");
    }
  });

});