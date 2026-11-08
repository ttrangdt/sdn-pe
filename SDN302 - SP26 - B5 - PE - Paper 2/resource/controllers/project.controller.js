const mongoose = require("mongoose");
const Project = require("../models/project.model");
const Department = require("../models/department.model");
const Employee = require("../models/employee.model");
const Workson = require("../models/workson.model");

const getAll = async (req, res) => {
  try {
    const list = await Project.find(req.query)
      .populate("depId")
      .populate("location.locId");
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
      .populate("depId")
      .populate("location.locId");
    if (!item) {
      return res
        .status(404)
        .json({ error: `Project with id = ${id} not found` });
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
      runValidators: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ error: `Project with id = ${id} not found` });
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
      return res
        .status(404)
        .json({ error: `Project with id = ${id} not found` });
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

    const item = await Department.findById(depId).populate(
      "managerId",
      "empName",
    );

    if (!item) {
      return res
        .status(404)
        .json({ error: `Department with _id= ${depId} not found` });
    }

    // const employee = await Employee.findById(item.managerId);
    const projectList = await Project.find({ depId });

    const result = {
      depName: item.depName,
      manager: item.managerId.empName,
      projects: projectList.map((e) => ({
        proId: e._id,
        proName: e.proName,
      })),
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const RetrieveEmployeesByProject = async (req, res) => {
  try {
    const { proId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(proId)) {
      return res.status(400).json({ error: `Invalid Project ID: ${proId}` });
    }

    const item = await Project.findById(proId);

    if (!item) {
      return res
        .status(404)
        .json({ error: `Project with _id = ${proId} not found` });
    }

    const worksons = await Workson.find({ proId }).populate(
      "empId",
      "empName empSalary",
    );

    console.log(worksons);

    const result = {
      project: item.proName,
      employees: worksons.map((e) => ({
        empName: e.empId.empName,
        empSalary: e.empId.empSalary,
        workHours: e.workHours,
      })),
    };
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { proName, depId, location, employees } = req.body;

    if (!mongoose.Types.ObjectId.isValid(depId)) {
      return res.status(400).json({ error: `Invalid Department ID: ${depId}` });
    }

    const department = await Department.findById(depId);

    if (!department) {
      return res
        .status(404)
        .json({ error: `Department with _id='${depId}'not found` });
    }

    let isFoundAll = true;
    let invalidEmps = [];

    let listEmployees = await Employee.find({});

    // console.log(listEmployees);
    employees.map((e) => {
      const employee = listEmployees.find(
        (c) => String(c._id) === String(e.empId),
      );

      if (!employee) {
        isFoundAll = false;
        invalidEmps.push(e.empId);
      }

      return 1;
    });

    // console.log(isFoundAll);
    if (!isFoundAll) {
      const result = {
        error: `Some employees do not exist`,
        invalidEmployees: invalidEmps,
      };
      return res.status(400).json(result);
    }

    console.log(location);

    const locs = location.map((p) => {
      return {
        locId: p.locaId,
      };
    });

    const newProject = await Project.create({
      proName: proName,
      depId: depId,
      location: locs,
    });

    const resultEmployees = [];

    for (e of employees) {
      const newWorkson = await Workson.create({
        empId: e.empId,
        proId: newProject._id,
        workHours: e.workHours,
      });

      resultEmployees.push({
        _id: newWorkson._id,
        proId: newWorkson.proId,
        empId: newWorkson.empId,
        workHours: newWorkson.workHours,
      });
    }

    const result = {
      message: "Project created successfully",
      newProject: {
        projectId: newProject._id,
        projectName: newProject.proName,
        worksons: resultEmployees,
      },
    };

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  RetrieveProjectsByDepartment,
  RetrieveEmployeesByProject,
  createProject,
  getAll,
  getById,
  create,
  update,
  deleteItem,
};
