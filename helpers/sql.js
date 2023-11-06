const { BadRequestError } = require("../expressError");

/**
 * Generates SQL query components for a partial update operation.
 *
 * Takes in a JavaScript object with data to be updated and a mapping of JavaScript property names to SQL column names. Then creates the SQL set clause and corresponding values for the update operation.
 *
 * @param {Object} dataToUpdate - The data to be updated in the database
 * @param {Object} jsToSql - A mapping of JavaScript property names to SQL column names
 * @returns {Object} An object containing the SQL set clause and the corresponding values
 * @throws {BadRequestError} Throws an error if no data is provided for the update
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  // Check if there is data to update
  if (keys.length === 0) throw new BadRequestError("No data");

  // Generate SQL set clause and values
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
