const mongoose = require("mongoose");
const Course = require("../models/course.model");
const Batch = require("../models/batch.model");

// const getAll = async (req, res) => {
//   try {
//     const list = await Cours.find(req.query);
//     return res.status(200).json(list);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// const getById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: `Invalid Cours ID: ${id}` });
//     }

//     const item = await Cours.findById(id);
//     if (!item) {
//       return res.status(404).json({ error: `Cours with id = ${id} not found` });
//     }

//     return res.status(200).json(item);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// const create = async (req, res) => {
//   try {
//     const newItem = await Cours.create(req.body);
//     return res.status(201).json(newItem);
//   } catch (error) {
//     return res.status(400).json({ error: error.message });
//   }
// };

// const update = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: `Invalid Cours ID: ${id}` });
//     }

//     const updated = await Cours.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updated) {
//       return res.status(404).json({ error: `Cours with id = ${id} not found` });
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
//       return res.status(400).json({ error: `Invalid Cours ID: ${id}` });
//     }

//     const deleted = await Cours.findByIdAndDelete(id);
//     if (!deleted) {
//       return res.status(404).json({ error: `Cours with id = ${id} not found` });
//     }

//     return res.status(200).json({ message: `Cours deleted successfully` });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

const registrationRetensionSummary = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: `Invalid courseId: ${courseId}` });
    }

    const item = await Course.findById(courseId);
    if (!item) {
      return res
        .status(404)
        .json({ error: `Course with id = ${courseId} not found` });
    }

    const batches = await Batch.find({ courseId });
    const result = batches.map((b) => {
      const enrolledStudent = b.registrations.filter(
        (r) => r.status === "enrolled",
      ).length;
      const droppedStudent = b.registrations.filter(
        (r) => r.status === "dropped",
      ).length;
      const rate = (enrolledStudent / (enrolledStudent + droppedStudent)) * 100;
      // let w = true;
      // if (rate < 80) {
      //   w = true;
      // } else {
      //   w = false;
      // }

      const w = rate < 80 ? true : false;
      return {
        batchId: b._id,
        batchName: b.batchName,
        enrolledCount: enrolledStudent,
        droppedCount: droppedStudent,
        retentionRate: rate,
        warning: w,
      };
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const retrieveCourse = async (req, res) => {
  try {
    const minWeeks = Number(req.query.minWeeks);
    const maxWeeks = Number(req.query.maxWeeks);

    // if (
    //   !Number.isInteger(minWeeks) ||
    //   !Number.isInteger(maxWeeks) ||
    //   minWeeks <= 0 ||
    //   maxWeeks <= 0
    // ) {
    //   return res.status(400).json({
    //     error: `minWeeks and maxWeeks are required and must be positive integers`,
    //   });
    // }
    if (
      !(
        Number.isInteger(minWeeks) &&
        Number.isInteger(maxWeeks) &&
        minWeeks > 0 &&
        maxWeeks > 0
      )
    ) {
      return res.status(400).json({
        error: `minWeeks and maxWeeks are required and must be positive integers`,
      });
    }

    if (minWeeks >= maxWeeks) {
      return res.status(400).json({
        error: `minWeeks must be less than or equal to maxWeeks`,
      });
    }
    const list = await Course.find({});
    const result = list.map((l) => {
      return {
        id: l._id,
        code: l.code,
        name: l.name,
        durationWeeks: l.durationWeeks,
        status: l.status,
      };
    });

    const result2 = result.filter(
      (e) => e.durationWeeks >= minWeeks && e.durationWeeks <= maxWeeks,
    );

    // .filter((e) => )
    return res.status(200).json(result2);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = {
  registrationRetensionSummary,
  retrieveCourse,
  // getAll,
  // getById,
  // create,
  // update,
  // deleteItem,
};
