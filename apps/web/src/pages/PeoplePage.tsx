import { useEffect, useMemo, useState } from "react";

import {
  createBatch,
  createDepartment,
  createUser,
  fetchBatches,
  fetchDepartments,
  fetchUsers,
  importUsers,
} from "../lib/api";

type UserRow = { _id: string; name: string; email: string; role: string; rollNumber: string | null };

type SelectOption = { _id: string; name: string };

export default function PeoplePage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [departments, setDepartments] = useState<SelectOption[]>([]);
  const [batches, setBatches] = useState<SelectOption[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("faculty");
  const [departmentId, setDepartmentId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("changeme123");

  const [csv, setCsv] = useState("name,email,role,departmentCode,batchName,rollNumber,password\n");
  const [message, setMessage] = useState<string | null>(null);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [batchName, setBatchName] = useState("");
  const [batchYear, setBatchYear] = useState("2026");
  const [batchDepartmentId, setBatchDepartmentId] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setUsers([]));
    fetchDepartments().then(setDepartments).catch(() => setDepartments([]));
    fetchBatches().then(setBatches).catch(() => setBatches([]));
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      await createUser({
        name,
        email,
        role: role as "admin" | "faculty" | "staff" | "student",
        departmentId: departmentId || undefined,
        batchId: batchId || undefined,
        rollNumber: rollNumber || undefined,
        password,
      });
      const updated = await fetchUsers();
      setUsers(updated);
      setName("");
      setEmail("");
      setRole("faculty");
      setDepartmentId("");
      setBatchId("");
      setRollNumber("");
      setPassword("changeme123");
      setMessage("User created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Create failed");
    }
  };

  const handleDepartment = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      await createDepartment(deptName, deptCode);
      const updated = await fetchDepartments();
      setDepartments(updated);
      setDeptName("");
      setDeptCode("");
      setMessage("Department created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Department failed");
    }
  };

  const handleBatch = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      await createBatch(batchName, Number(batchYear), batchDepartmentId);
      const updated = await fetchBatches();
      setBatches(updated);
      setBatchName("");
      setBatchYear("2026");
      setBatchDepartmentId("");
      setMessage("Batch created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Batch failed");
    }
  };

  const handleImport = async () => {
    setMessage(null);
    try {
      await importUsers(csv);
      const updated = await fetchUsers();
      setUsers(updated);
      setMessage("Import complete.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed");
    }
  };

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        (user.rollNumber ?? "").toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, search, users]);

  const rosterStats = useMemo(
    () => ({
      total: users.length,
      faculty: users.filter((user) => user.role === "faculty").length,
      students: users.filter((user) => user.role === "student").length,
      admins: users.filter((user) => user.role === "admin").length,
    }),
    [users]
  );

  return (
    <div className="grid">
      <section className="metric-strip wide-card">
        <div>
          <span>Total people</span>
          <strong>{rosterStats.total}</strong>
        </div>
        <div>
          <span>Faculty</span>
          <strong>{rosterStats.faculty}</strong>
        </div>
        <div>
          <span>Students</span>
          <strong>{rosterStats.students}</strong>
        </div>
        <div>
          <span>Admins</span>
          <strong>{rosterStats.admins}</strong>
        </div>
      </section>

      <div className="card">
        <div className="section-title">
          <h3>Departments & batches</h3>
        </div>
        <form className="form-grid" onSubmit={handleDepartment}>
          <label className="input">
            Department name
            <input value={deptName} onChange={(event) => setDeptName(event.target.value)} />
          </label>
          <label className="input">
            Department code
            <input value={deptCode} onChange={(event) => setDeptCode(event.target.value)} />
          </label>
          <button className="button" type="submit">
            Create department
          </button>
        </form>
        <form className="form-grid" onSubmit={handleBatch}>
          <label className="input">
            Batch name
            <input value={batchName} onChange={(event) => setBatchName(event.target.value)} />
          </label>
          <label className="input">
            Batch year
            <input value={batchYear} onChange={(event) => setBatchYear(event.target.value)} />
          </label>
          <label className="input">
            Department
            <select value={batchDepartmentId} onChange={(event) => setBatchDepartmentId(event.target.value)}>
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <button className="button secondary" type="submit">
            Create batch
          </button>
        </form>
        {message ? <div className="notice">{message}</div> : null}
      </div>
      <div className="card">
        <div className="section-title">
          <h3>Add staff or students</h3>
        </div>
        <form className="form-grid" onSubmit={handleCreate}>
          <label className="input">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="input">
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="input">
            Role
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="faculty">Faculty</option>
              <option value="staff">Staff</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="input">
            Department
            <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <label className="input">
            Batch
            <select value={batchId} onChange={(event) => setBatchId(event.target.value)}>
              <option value="">Select batch</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </label>
          <label className="input">
            Roll number
            <input value={rollNumber} onChange={(event) => setRollNumber(event.target.value)} />
          </label>
          <label className="input">
            Temp password
            <input value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button className="button" type="submit">
            Create user
          </button>
        </form>
        {message ? <div className="notice">{message}</div> : null}
      </div>

      <div className="card">
        <div className="section-title">
          <h3>Bulk import (CSV)</h3>
          <button className="button secondary" onClick={handleImport}>
            Import
          </button>
        </div>
        <p>
          Columns: name, email, role, departmentCode, batchName, rollNumber, password. Use department code like CSE
          and batch name like CSE 2026.
        </p>
        <label className="input">
          CSV data
          <textarea value={csv} onChange={(event) => setCsv(event.target.value)} />
        </label>
      </div>

      <div className="card">
        <div className="section-title">
          <h3>Directory</h3>
        </div>
        <div className="toolbar">
          <label className="input">
            Search directory
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, roll no" />
          </label>
          <label className="input">
            Role
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="all">All roles</option>
              <option value="admin">Admins</option>
              <option value="faculty">Faculty</option>
              <option value="staff">Staff</option>
              <option value="student">Students</option>
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Roll no</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td data-label="Name">{user.name}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Role">{user.role}</td>
                  <td data-label="Roll no">{user.rollNumber ?? "--"}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 ? (
                <tr>
                  <td data-label="Directory" colSpan={4}>
                    No matching people found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
