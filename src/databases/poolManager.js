const mssql = require("mssql");
const pools = new Map();
const config = require(`../config/${process.env.NODE_ENV || "development"}`);
module.exports = {
  /**
   * Get or create a pool. If a pool doesn't exist the config must be provided.
   * If the pool does exist the config is ignored
   * (even if it was different to the one provided
   * when creating the pool)
   *
   * @param {string} name
   * @return {Promise.<mssql.ConnectionPool>}
   */
  get: async (name) => {
    if (!pools.has(name)) {
      if (!config.dbConfig) {
        throw new Error("Pool does not exist");
      }
      try {
        const pool = new mssql.ConnectionPool(config.dbConfig);
        const close = pool.close.bind(pool);
        pool.close = (...args) => {
          pools.delete(name);
          return close(...args);
        };
        pools.set(name, await pool.connect());
      } catch (err) {
        throw new Error(err);
      }
    }
    return pools.get(name);
  },
  /**
   * Closes all the pools and removes them from the store
   *
   * @return {Promise<mssql.ConnectionPool[]>}
   */
  closeAll: () =>
    Promise.all(
      Array.from(pools.values()).map((connect) => {
        return connect.then((pool) => pool.close());
      })
    ),
};
