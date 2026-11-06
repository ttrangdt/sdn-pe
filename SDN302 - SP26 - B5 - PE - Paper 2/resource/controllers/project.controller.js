const mongoose = require('mongoose');
const Project = require('../../../SDN302 - SP26 - B5 - PE - Paper 2 copy/resource/models/project.model');
const Department = require('../../../SDN302 - SP26 - B5 - PE - Paper 2 copy/resource/models/department.model');
const Employee = require('../../../SDN302 - SP26 - B5 - PE - Paper 2 copy/resource/models/employee.model');

const getAll = async (req, res) => {
  try {
    const list = await Project.find(req.query)
      .populate('depId')
      .populate('location.locId');
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Project ID: ${id}` });
    }

    const item = await Project.findById(id)
      .populate('depId')
      .populate('location.locId');
    if (!item) {
      return res.status(404).json({ error: `Project with id = ${id} not found` });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newItem = await Project.create(req.body);
    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Project ID: ${id}` });
    }

    const updated = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: `Project with id = ${id} not found` });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Project ID: ${id}` });
    }

    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: `Project with id = ${id} not found` });
    }

    return res.status(200).json({ message: `Project deleted successfully` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const RetrieveProjectsByDepartment = async (req, res) => {
  try {
    const { depId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(depId)) {
      return res.status(400).json({ error: `Invalid ObjectId: ${depId}` });
    }

	const item = await Department.findById(depId)

	if (!item) {
	return res.status(404).json({ error: `Department with id = ${id} not found` });
	}

	const employee = await Employee.findById(item.managerId);
	const projectList = await Project.find({depId});

	const result =  {
		depName: item.depName,
		manager: employee.empName,
		projects: projectList.map((e) => ({
		proId: e._id,
		proName: e.proName
	})) 
	}
	
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// const RetrieveEmployeesByProject = async (req, res) => {
//   try {
//     const { proId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(proId)) {
//       return res.status(400).json({ error: `Invalid ObjectId: ${proId}` });
//     }

// 	const prj = await Project.findById(depId)

// 	if (!prj) {
// 	return res.status(404).json({ error: `Project with _id = ${id} not found` });
// 	}

// 	const employee = await Employee.findById(item.managerId);
// 	const projectList = await Project.find({depId});

// 	const result =  {
// 		depName: item.depName,
// 		manager: employee.empName,
// 		projects: projectList.map((e) => ({
// 		proId: e._id,
// 		proName: e.proName
// 	})) 
// 	}
	
//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

module.exports = {
  RetrieveProjectsByDepartment,
//   RetrieveEmployeesByProject,
  getAll,
  getById,
  create,
  update,
  deleteItem
};
