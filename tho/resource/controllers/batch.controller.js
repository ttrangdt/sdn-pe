const mongoose = require("mongoose");
const Batch = require("../models/batch.model");
const Learner = require("../models/learner.model");

// const getAll = async (req, res) => {
//   try {
//     const list = await Batch.find(req.query)
//       .populate("courseId")
//       .populate("registrations.learnerId");
//     return res.status(200).json(list);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// const getById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: `Invalid Batch ID: ${id}` });
//     }

//     const item = await Batch.findById(id)
//       .populate("courseId")
//       .populate("registrations.learnerId");
//     if (!item) {
//       return res.status(404).json({ error: `Batch with id = ${id} not found` });
//     }

//     return res.status(200).json(item);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// const create = async (req, res) => {
//   try {
//     const newItem = await Batch.create(req.body);
//     return res.status(201).json(newItem);
//   } catch (error) {
//     return res.status(400).json({ error: error.message });
//   }
// };

// const update = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: `Invalid Batch ID: ${id}` });
//     }

//     const updated = await Batch.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updated) {
//       return res.status(404).json({ error: `Batch with id = ${id} not found` });
//     }

//     return res.status(200).json(updated);
//   } catch (error) {
//     return res.status(400).json({ error: error.message });
//   }
// };

// const deleteItem = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: `Invalid Batch ID: ${id}` });
//     }

//     const deleted = await Batch.findByIdAndDelete(id);
//     if (!deleted) {
//       return res.status(404).json({ error: `Batch with id = ${id} not found` });
//     }

//     return res.status(200).json({ message: `Batch deleted successfully` });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

const retrieveBatchesMyMini = async (req, res) => {
  try {
    const minEnrolled = Number(req.query.minEnrolled);
    if (!Number.isInteger(minEnrolled) || minEnrolled < 0) {
      return res
        .status(400)
        .json({ error: `Invalid minEnrolled: ${req.query.minEnrolled}` });
    }
    const list = await Batch.find({})
      .populate("courseId")
      .populate("registrations.learnerId");

    const result = list
      .map((e) => {
        const countStudent = e.registrations.filter(
          (e) => e.status === "enrolled",
        ).length;
        return {
          id: e._id,
          batchName: e.batchName,
          instructorName: e.instructorName,
          status: e.status,
          enrolledCount: countStudent,
        };
      })
      .filter((e) => e.enrolledCount >= minEnrolled);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateALearner = async (req, res) => {
  try {
    const { batchId, learnerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ error: `Invalid batchId: ${batchId}` });
    }
    if (!mongoose.Types.ObjectId.isValid(learnerId)) {
      return res.status(400).json({ error: `Invalid learnerid: ${learnerId}` });
    }

    const batch = await Batch.findById(batchId).populate(
      "registrations.learnerId",
    );
    if (!batch) {
      return res
        .status(404)
        .json({ error: `Batch with id = ${batchId} not found` });
    }

    const isFoundLearner = batch.registrations.find(
      (e) => String(e.learnerId._id) === learnerId,
    );

    if (!isFoundLearner) {
      return res.status(404).json({
        error: `Learner ${learnerId} has no registration record in ${batch.batchName}`,
      });
    }

    const { status } = req.body;
    if (status !== "enrolled" && status !== "dropped") {
      return res.status(400).json({
        error: `Invalid status: ${status}`,
      });
    }

    if (batch.status === "CLOSED") {
      return res.status(400).json({
        error: `Batch ${batch.batchName} is closed and cannot be modified`,
      });
    }

    if (isFoundLearner.status === status) {
      return res.status(400).json({
        error: `Learner ${isFoundLearner.learnerId.learnerCode} is already ${status} in this batch`,
      });
    }

    isFoundLearner.status = status;

    await batch.save();

    const result = {
      batchId: batch._id,
      learnerId: isFoundLearner.learnerId._id,
      learnerCode: isFoundLearner.learnerId.learnerCode,
      fullName: isFoundLearner.learnerId.fullName,
      status: isFoundLearner.status,
    };
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
const intructorSummary = async (req, res) => {
  try {
    const { instructor } = req.query;
    if (!instructor) {
      return res
        .status(400)
        .json({ error: `Query param instructor is required` });
    }

    const batch = await Batch.find({}).populate("courseId");

    const isBatchFound = batch.filter(
      (e) =>
        e.instructorName.trim().toLowerCase() ===
        instructor.trim().toLowerCase(),
    );

    if (!(isBatchFound.length > 0)) {
      return res
        .status(404)
        .json({ error: `No batches found for instructor ${instructor}` });
    }

    let sumWeeks = 0;
    isBatchFound.map((e) => (sumWeeks += e.courseId.durationWeeks));

    let sumStudents = 0;
    isBatchFound.map((b) => {
      const countStudent = b.registrations.filter(
        (b) => b.status === "enrolled",
      ).length;

      return (sumStudents += countStudent);
    });

    const result = {
      instructorName: instructor,
      totalBatches: isBatchFound.length,
      totalDurationWeeks: sumWeeks,
      totalEnrolledLearners: sumStudents,
      batches: isBatchFound.map((b) => {
        const countStudent = b.registrations.filter(
          (b) => b.status === "enrolled",
        ).length;
        return {
          batchName: b.batchName,
          courseName: b.courseId.name,
          courseDurationWeeks: b.courseId.durationWeeks,
          enrolledCount: countStudent,
          status: b.status,
        };
      }),
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  retrieveBatchesMyMini,
  updateALearner,
  intructorSummary,
  // getAll,
  // getById,
  // create,
  // update,
  // deleteItem,
};
