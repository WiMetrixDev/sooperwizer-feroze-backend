"use strict";

const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

const errors = require("../validations/error-handler.js");
const errorHandler = errors.errorHandler;

module.exports = {
  getData: async (request, reply) => {
    const cardType = request.params.cardType;
    let response;
    if (cardType) {
      try {
        switch (cardType) {
          case "5":
            response = await prisma.worker.findMany();
            break;
          case "6":
            response = await prisma.operation.findMany();
            break;
          case "8":
            response = await prisma.machine.findMany();
            break;
          case "10":
            response = await prisma.line.findMany();
            break;
          default:
            reply.notFound("Card Type Doesnt Exists!");
        }
        const message = errorHandler(3, null, response);
        return message;
      } catch (error) {
        const errorStr = error.toString();
        reply.internalServerError(errorStr);
      }
    } else {
      reply.badRequest("Insufficient or invalid Parameters");
    }
  },
  getAllInfoForTagID: async (request, reply) => {
    const tagID = request.params.tagID;
    let response;
    try {
      let response1 = await prisma.tag.findFirst({
        where: { TagID: parseInt(tagID) },
        include: {
          cut_report: true,
          // include: {
          //   cut_job: true,
          //   // include: {
          //   //   production_order: true,
          //   //   include: {
          //   //     sale_order: true,
          //   //   },
          //   // },
          // },
        },
      });
      if (!response1) {
        reply.notFound("Information aginst Tag not found");
        const message = errorHandler(3, null, response);
        return message;
      }
      let response2 = await prisma.cut_job.findFirst({
        where: { CutJobID: parseInt(response1.cut_report.CutJobID) },
        include: {
          production_order: true,
        },
      });
      if (!response2) {
        reply.notFound("Information aginst Tag not found");
        const message = errorHandler(3, null, response);
        return message;
      }
      let response3 = await prisma.production_order.findFirst({
        where: {
          ProductionOrderID: parseInt(response2.ProductionOrderID),
        },
        include: { sale_order: true },
      });
      if (!response3) {
        reply.notFound("Information aginst Tag not found");
        const message = errorHandler(3, null, response);
        return message;
      }

      response = { ...response1, ...response2, ...response3 };

      if (!response) {
        reply.notFound("Information aginst Tag not found");
        const message = errorHandler(3, null, response);
        return message;
      }
      const message = errorHandler(3, null, response);
      return message;
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
  getDataForCard: async (request, reply) => {
    const cardType = request.params.cardType;
    const cardNumber = request.params.cardNumber;
    let response;
    if (cardType) {
      try {
        switch (cardType) {
          case "5":
            response = await prisma.worker.findFirst({
              where: { WorkerID: parseInt(cardNumber) },
            });
            break;
          case "6":
            response = await prisma.operation.findFirst({
              where: { OperationID: parseInt(cardNumber) },
            });
            break;
          case "8":
            response = await prisma.machine.findFirst({
              where: { MachineID: parseInt(cardNumber) },
            });
            break;
          case "10":
            response = await prisma.line.findFirst({
              where: { LineID: parseInt(cardNumber) },
            });
            break;
          default:
            reply.notFound("Card Type Doesnt Exists!");
        }
        if (!response) {
          reply.notFound("No information found against Card!");
        }
        const message = errorHandler(3, null, response);
        return message;
      } catch (error) {
        const errorStr = error.toString();
        reply.internalServerError(errorStr);
      }
    } else {
      reply.badRequest("Insufficient or invalid Parameters");
    }
  },
  assignTagToBundle: async (request, reply) => {
    const TagID = parseInt(request.body.TagID);
    const BundleID = parseInt(request.body.BundleID);
    const ForceWrite = request.body.ForceWrite;
    let update;
    let message;
    try {
      const response = await prisma.tag.findFirst({
        where: { TagID: TagID },
      });
      if (!response) {
        let insertTag = await prisma.tag.create({
          data: {
            TagID: TagID,
            BundleID: BundleID,
          },
        });

        message = errorHandler(3, null, response);
        return message;
      } else {
        if (ForceWrite === "true") {
          update = await prisma.tag.update({
            where: { TagID: TagID },
            data: { BundleID: BundleID },
          });
          message = errorHandler(3, null, update);
          return message;
        } else {
          reply.badRequest("Tag Already assigned to Bundle");
        }
      }
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
};
