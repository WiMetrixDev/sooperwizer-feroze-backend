const path = require('path');
const util = require('util');
const mv = require('mv');
const { writeFile, mkdir } = require('fs/promises');
const { existsSync, mkdirSync } = require('fs');
const mvPromisified = util.promisify(mv);
/**
 * @param {any} request
 * @param {'Worker' | 'Operation' | 'Machine'} table
 * @param {string | number} identifier
 * @param {boolean} [isForUpdate]
 * @return {Promise<string | [string, string]>}
 */
const uploadImage = async (
  request,
  table,
  identifier,
  isForUpdate,
) => {
  try {
    const file = request.body.picture;
    if (!file) return isForUpdate ? '' : ['', ''];
    path.join(
      process.env.IMG_PATH,
      `${table.toLowerCase()}s`,
    );
    const writeTo = path.join(
      dir,
      `${identifier}.png`,
    );
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    await writeFile(writeTo, file);
    const timeStamp = new Date().toISOString();
    if (isForUpdate) {
      return `
        , ${table}ImageURL = '${timeStamp}'
        , ${table}ThumbnailURL = '${timeStamp}'
      `;
    } else {
      return [
        `, [${table}ImageUrl], [${table}ThumbnailUrl]`,
        `, '${timeStamp}', '${timeStamp}'`,
      ];
    }
  } catch (error) {
    throw new Error(`Problem Saving Image: ${error.message}`);
  }
};

module.exports = uploadImage;
