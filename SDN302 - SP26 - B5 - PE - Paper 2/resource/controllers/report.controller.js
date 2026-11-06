const mongoose = require('mongoose');
const Project = require('../models/project.model');
const Department = require('../models/department.model');
const Employee = require('../models/employee.model');
const Location = require('../models/location.model');
const Workson = require('../models/workson.model');


const getProjectWorkHoursReport = async (req, res) => {
  try {
	const result = await Workson.aggregate([
		  {
    $match: { status: "PRESENT" },
  },	
	])
	 return res.status(200).json(result);
  } catch (error) {
	 return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProjectWorkHoursReport
};
