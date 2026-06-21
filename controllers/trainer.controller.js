const { getCollections } = require('../config/db');
const { ObjectId } = require('mongodb');

// POST /trainer-applications -> user applies to be trainer
const applyAsTrainer = async (req, res) => {
  const { trainerApplicationsCollection, usersCollection } = getCollections();
  const application = req.body; // { name, email, image, experience, specialty }

  const existing = await trainerApplicationsCollection.findOne({
    email: application.email,
    status: 'pending',
  });
  if (existing) {
    return res.status(409).send({ message: 'Application already pending' });
  }

  const result = await trainerApplicationsCollection.insertOne({
    ...application,
    status: 'pending',
    feedback: '',
    appliedAt: new Date(),
  });

  await usersCollection.updateOne(
    { email: application.email },
    { $set: { trainerApplicationStatus: 'pending' } }
  );

  res.send(result);
};

// GET /trainer-applications -> admin, all pending applications
const getPendingApplications = async (req, res) => {
  const { trainerApplicationsCollection } = getCollections();
  const result = await trainerApplicationsCollection
    .find({ status: 'pending' })
    .toArray();
  res.send(result);
};

// PATCH /trainer-applications/approve/:id -> admin
const approveApplication = async (req, res) => {
  const { trainerApplicationsCollection, usersCollection } = getCollections();
  const id = req.params.id;

  const application = await trainerApplicationsCollection.findOne({ _id: new ObjectId(id) });
  if (!application) return res.status(404).send({ message: 'Application not found' });

  await trainerApplicationsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: 'approved' } }
  );

  const result = await usersCollection.updateOne(
    { email: application.email },
    { $set: { role: 'trainer', trainerApplicationStatus: 'approved' } }
  );

  res.send(result);
};

// PATCH /trainer-applications/reject/:id -> admin, with feedback
const rejectApplication = async (req, res) => {
  const { trainerApplicationsCollection, usersCollection } = getCollections();
  const id = req.params.id;
  const { feedback } = req.body;

  const application = await trainerApplicationsCollection.findOne({ _id: new ObjectId(id) });
  if (!application) return res.status(404).send({ message: 'Application not found' });

  await trainerApplicationsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: 'rejected', feedback } }
  );

  const result = await usersCollection.updateOne(
    { email: application.email },
    { $set: { trainerApplicationStatus: 'rejected', trainerFeedback: feedback } }
  );

  res.send(result);
};

// GET /trainer-applications/trainers -> admin, Manage Trainers page (all role=trainer users)
const getAllTrainers = async (req, res) => {
  const { usersCollection } = getCollections();
  const trainers = await usersCollection.find({ role: 'trainer' }).toArray();
  res.send(trainers);
};

module.exports = {
  applyAsTrainer,
  getPendingApplications,
  approveApplication,
  rejectApplication,
  getAllTrainers,
};
