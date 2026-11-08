const mongoose = require('mongoose');
const Workson = require('../models/workson.model');

const getProjectWorkHoursReport = async (req, res) => {
  try {
    const result = await Workson.aggregate([
      {
        $group: {
          _id: '$proId',
          totalWorkHours: { $sum: '$workHours' },
          totalEmployees: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $unwind: '$project'
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'project.depId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $sort: {
          totalWorkHours: -1
        }
      },
      {
        $project: {
          _id: 0,
          totalWorkHours: 1,
          totalEmployees: 1,
          projectName: '$project.proName',
          departmentName: '$department.depName'
        }
      }
    ]);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProjectWorkHoursReport
};
