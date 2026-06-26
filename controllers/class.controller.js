const { getCollections } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET /classes -> public, only approved, with search ($regex), filter ($in), pagination
const getAllClasses = async (req, res) => {
  const { classesCollection } = getCollections();
  const { search = '', category, page = 1, limit = 6 } = req.query;

  const query = { status: 'approved' };

  if (search) {
    query.className = { $regex: search, $options: 'i' };
  }
  if (category && category !== 'all') {
    query.category = { $in: [category] };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const classes = await classesCollection
    .find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .toArray();

  const total = await classesCollection.countDocuments(query);

  res.send({ classes, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
};

// GET /classes/featured -> public, top classes by bookingCount, for home page
const getFeaturedClasses = async (req, res) => {
  const { classesCollection } = getCollections();
  const classes = await classesCollection
    .find({ status: 'approved' })
    .sort({ bookingCount: -1 })
    .limit(6)
    .toArray();
  res.send(classes);
};

// GET /classes/:id -> private, single class details
const getClassById = async (req, res) => {
  const { classesCollection } = getCollections();
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'Invalid class ID' });
  }

  const result = await classesCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
};

// GET /classes/trainer/:email -> private, trainer's own classes
const getClassesByTrainer = async (req, res) => {
  const { classesCollection } = getCollections();
  const email = req.params.email;
  const result = await classesCollection
    .find({ trainerEmail: email })
    .toArray();
  res.send(result);
};

// POST /classes -> trainer only
const addClass = async (req, res) => {
  const { classesCollection } = getCollections();
  const newClass = {
    ...req.body,
    status: 'pending',
    bookingCount: 0,
    createdAt: new Date(),
  };
  const result = await classesCollection.insertOne(newClass);
  res.send(result);
};

// PATCH /classes/:id -> trainer (update own class) or admin (status change)
const updateClass = async (req, res) => {
  const { classesCollection } = getCollections();
  const id = req.params.id;
  const updatedData = req.body;
  const result = await classesCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  );
  res.send(result);
};

// DELETE /classes/:id -> trainer (own) or admin
const deleteClass = async (req, res) => {
  const { classesCollection } = getCollections();
  const id = req.params.id;
  const result = await classesCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};

// GET /classes/:id/attendees -> trainer only, students who booked this class
const getClassAttendees = async (req, res) => {
  const { bookingsCollection } = getCollections();
  const classId = req.params.id;
  const attendees = await bookingsCollection
    .find({ classId })
    .project({ studentName: 1, studentEmail: 1 })
    .toArray();
  res.send(attendees);
};

module.exports = {
  getAllClasses,
  getFeaturedClasses,
  getClassById,
  getClassesByTrainer,
  addClass,
  updateClass,
  deleteClass,
  getClassAttendees,
};
