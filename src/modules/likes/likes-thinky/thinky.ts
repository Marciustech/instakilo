import * as thinky from "thinky";

const dbConfig = {
  host: process.env.RETHINK_HOST,
  port: parseInt(process.env.RETHINK_PORT),
  db: process.env.RETHINK_DB,
};

const thinkyInstance = thinky(dbConfig);

export { thinkyInstance as thinky };
