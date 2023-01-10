/* eslint-disable max-len */
'use strict';
const dotenv = require('dotenv');
const path = require('path');
const os = require('os');
const fs = require('fs');

dotenv.config();

const environment = process.env.NODE_ENV || 'development';

const config = require(`./config/${environment}`);
const { get } = require('./databases/poolManager');

process.env.IMG_PATH = (
  process.env.IMG_PATH ??
  path.join(os.homedir(), '.sooperwizer', 'images')
);

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  },
  production: {
    level: 'info',
    file: './error.logs',
  },
  test: false,
};
const fastify = require('fastify')({
  logger: envToLogger[environment] ?? true,
});
fastify.register(require('@fastify/cors'), {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  // allowedHeaders: ["Content-Type", "Authorization"],
});
fastify.register(require('@fastify/sensible'));

fastify.register(require('@fastify/multipart'), {
  attachFieldsToBody: 'keyValues',
  onFile: async (part) => {
    const buff = await part.toBuffer();
    part.value = buff; // set `part.value` to specify the request body value
  },
});

fastify.register(require('@fastify/static'), {
  root: process.env.IMG_PATH,
  prefix: '/images/',
});

if (!fs.existsSync(process.env.IMG_PATH)) {
  fs.mkdirSync(process.env.IMG_PATH, { recursive: true });
}

const cutjobs = require('./routes/spts/cutJob.route');
const departments = require('./routes/spts/department.route');
const saleorders = require('./routes/spts/saleOrder.route');
const markers = require('./routes/spts/marker.route');
const cutreports = require('./routes/spts/cutReport.route');
const productionOrder = require('./routes/spts/productionOrder.route');
const boxes = require('./routes/spts/box.route');
const lines = require('./routes/spts/line.route');
const machines = require('./routes/spts/machine.route');
const machinetypes = require('./routes/spts/machineType.route');
const operations = require('./routes/spts/operation.route');
const sections = require('./routes/spts/section.route');
const styles = require('./routes/spts/style.route');
const workers = require('./routes/spts/worker.route');
const users = require('./routes/floorOperations/user.route');
const cardManager = require('./routes/floorOperations/cardManager.route');
const styletemplates = require('./routes/spts/styleTemplate.route');
const inline = require('./routes/sqms/inline.route');
const endline = require('./routes/sqms/endline.route');
const faults = require('./routes/sqms/fault.route');
const sizes = require('./routes/spts/size.route');
const colors = require('./routes/spts/color.route');
const versions = require('./routes/sqms/versions.route');
const scans = require('./routes/spts/scans.route');
const downtime = require('./routes/floorOperations/downtime.route');
const lineLayout = require('./routes/floorOperations/lineLayout.route');
const DOMA = require('./routes/floorOperations/DOMA/DOMA.route');
const targetfeeding = require('./routes/floorOperations/targetFeeding.route');

fastify.register(boxes);
fastify.register(departments);
fastify.register(lines);
fastify.register(machines);
fastify.register(machinetypes);
fastify.register(operations);
fastify.register(saleorders);
fastify.register(sections);
fastify.register(styles);
fastify.register(workers);
fastify.register(cutjobs);
fastify.register(markers);
fastify.register(cutreports);
fastify.register(productionOrder);
fastify.register(users);
fastify.register(cardManager);
fastify.register(styletemplates);
fastify.register(inline);
fastify.register(endline);
fastify.register(faults);
fastify.register(colors);
fastify.register(sizes);
fastify.register(versions);
fastify.register(scans);
fastify.register(downtime);
fastify.register(lineLayout);
fastify.register(DOMA);
fastify.register(targetfeeding);

const databaseConnection = async () => {
  fastify.log.info(`Connecting to DB: Server: ${config.dbConfig.server}, Database: ${config.dbConfig.database}`);
  try {
    const readPool = await get('read');
    const addPool = await get('add');
    global.readPool = readPool;
    global.addPool = addPool;
    fastify.log.info('DB Connection Successful!');
  } catch (error) {
    setTimeout(() => {
      fastify.log.info('Retrying DB connection...');
      databaseConnection();
    }, 60000);
    fastify.log.error(`DB Connection Error!`);
    fastify.log.error(error.message ?? error.toString());
    fastify.log.info('Retrying DB Connection in 60 seconds');
  }
};

const start = async () => {
  try {
    await fastify.listen({
      host: process.env.IP,
      port: process.env.PORT,
    });
    databaseConnection();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
