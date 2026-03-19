"use client";

import React, { useState, useEffect } from "react";

interface EquipmentCheckinType {
  id: string;
  equipment_name: string;
  scout_name: string;
  condition: string;
  notes: string;
  workflow_status: string;
  checkout_date: string;
  checkin_date: string;
  created_at: string;
}

export default function EquipmentCheckinPage() {
  const [data, setData] = useState<EquipmentCheckinType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentCheckinType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [equipmentName, setEquipmentName] = useState("");
  const [scoutName, setScoutName] = useState("");
  const [condition, setCondition] = useState("Good");
  const [notes, setNotes] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState("Pending");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [checkinDate, setCheckinDate] = useState(new Date().toISOString().split('T')[0]);

  async function fetchData() {
    try {
      const res = await fetch("/api/equipment-checkin");
      if (!res.ok) throw new Error("Failed to fetch data");
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item =>
    item.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.scout_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = data.length;
  const goodConditionCount = data.filter(item => item.condition === "Good").length;
  const badConditionCount = data.filter(item => item.condition === "Bad").length;
  const missingCount = data.filter(item => item.condition === "Missing/Lost").length;

  function resetForm() {
    setEquipmentName("");
    setScoutName("");
    setCondition("Good");
    setNotes("");
    setWorkflowStatus("Pending");
    setCheckoutDate("");
    setCheckinDate(new Date().toISOString().split('T')[0]);
    setEditingItem(null);
    setError("");
    setFieldErrors({});
    setSuccess("");
  }

  function handleEdit(item: EquipmentCheckinType) {
    setEditingItem(item);
    setEquipmentName(item.equipment_name);
    setScoutName(item.scout_name);
    setCondition(item.condition);
    setNotes(item.notes);
    setWorkflowStatus(item.workflow_status);
    setCheckoutDate(item.checkout_date);
    setCheckinDate(item.checkin_date);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!equipmentName.trim()) errors.equipmentName = "Equipment name is required";
    if (!scoutName.trim()) errors.scoutName = "Scout name is required";
    if (!condition.trim()) errors.condition = "Condition is required";
    if (!checkoutDate.trim()) errors.checkoutDate = "Checkout date is required";
    if (!checkinDate.trim()) errors.checkinDate = "Check-in date is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        equipment_name: equipmentName,
        scout_name: scoutName,
        condition,
        notes,
        workflow_status: workflowStatus,
        checkout_date: checkoutDate,
        checkin_date: checkinDate
      };

      const res = await fetch("/api/equipment-checkin", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem ? { ...payload, id: editingItem.id } : payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Save failed");
      }

      setSuccess(editingItem ? "Updated successfully!" : "Created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this check-in record?")) return;

    try {
      setSaving(true);
      const res = await fetch("/api/equipment-checkin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (!res.ok) throw new Error("Delete failed");

      setSuccess("Deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function getConditionBadgeColor(condition: string) {
    switch (condition) {
      case "Good": return "bg-green-100 text-green-800";
      case "Bad": return "bg-yellow-100 text-yellow-800";
      case "Missing/Lost": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  function getWorkflowBadgeColor(status: string) {
    switch (status) {
      case "Complete": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Requires Action": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading equipment check-ins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Equipment Check-in & Condition Reporting</h1>
          <p className="text-gray-600">Mandatory condition assessment workflow for returned equipment</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-sm text-gray-600">Total Check-ins</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-2xl font-bold text-green-600">{goodConditionCount}</div>
            <div className="text-sm text-gray-600">Good Condition</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-2xl font-bold text-yellow-600">{badConditionCount}</div>
            <div className="text-sm text-gray-600">Needs Replacement</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-2xl font-bold text-red-600">{missingCount}</div>
            <div className="text-sm text-gray-600">Missing/Lost</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <input
                type="text"
                placeholder="Search equipment, scout, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={saving}
              >
                ➕ Add Check-in
              </button>
            </div>
          </div>

          {data.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No equipment check-ins yet</h3>
              <p className="text-gray-600 mb-6">Start tracking equipment condition assessments</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Check-in
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Equipment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Scout</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Condition</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Workflow Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Check-in Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} className="border-t border-gray-200">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{item.equipment_name}</div>
                        {item.notes && <div className="text-sm text-gray-600">{item.notes}</div>}
                      </td>
                      <td className="py-3 px-4 text-gray-900">{item.scout_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionBadgeColor(item.condition)}`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkflowBadgeColor(item.workflow_status)}`}>
                          {item.workflow_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {new Date(item.checkin_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            disabled={saving}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            disabled={saving}
                          >
                            {saving ? "Deleting..." : "🗑️ Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingItem ? "Edit Check-in" : "New Equipment Check-in"}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={equipmentName}
                      onChange={(e) => setEquipmentName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={saving}
                    />
                    {fieldErrors.equipmentName && <p className="text-red-500 text-xs mt-1">{fieldErrors.equipmentName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scout Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={scoutName}
                      onChange={(e) => setScoutName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={saving}
                    />
                    {fieldErrors.scoutName && <p className="text-red-500 text-xs mt-1">{fieldErrors.scoutName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={saving}
                    >
                      <option value="Good">Good (Still functional)</option>
                      <option value="Bad">Bad (needs replacement)</option>
                      <option value="Missing/Lost">Missing/Lost</option>
                    </select>
                    {fieldErrors.condition && <p className="text-red-500 text-xs mt-1">{fieldErrors.condition}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Workflow Status
                    </label>
                    <select
                      value={workflowStatus}
                      onChange={(e) => setWorkflowStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={saving}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Complete">Complete</option>
                      <option value="Requires Action">Requires Action</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Checkout Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={checkoutDate}
                      onChange={(e) => setCheckoutDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={saving}
                    />
                    {fieldErrors.checkoutDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.checkoutDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={checkinDate}
                      onChange={(e) => setCheckinDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={saving}
                    />
                    {fieldErrors.checkinDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.checkinDate}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Condition details, damage description, etc."
                    disabled={saving}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : editingItem ? "Update Check-in" : "Create Check-in"}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}