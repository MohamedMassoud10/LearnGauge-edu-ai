const asyncHandlerr = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  asyncHandlerr(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No documents for this id ${id}`), 404);
    }
    res.status(204).send();
  });

exports.updateOne = (Model) =>
  asyncHandlerr(async (req, res, next) => {
    const documents = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!documents) {
      return next(
        new ApiError(`No documents for this id ${req.params.id}`),
        404
      );
    }
    res.status(200).json({ data: documents });
  });

exports.createOne = (Model) =>
  asyncHandlerr(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model) =>
  asyncHandlerr(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id);
    if (!document) {
      return next(new ApiError(`No document for this id ${id}`), 404);
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = "", populateOptions = null) =>
  asyncHandlerr(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    let { mongooseQuery, paginationResult } = apiFeatures;

    // Apply populate if provided
    if (populateOptions) {
      mongooseQuery = mongooseQuery.populate(populateOptions);
    }

    const documents = await mongooseQuery;

    res.status(200).json({
      results: documents.length,
      paginationResult,
      data: documents,
    });
  });
