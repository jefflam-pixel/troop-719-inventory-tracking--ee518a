"use client";

import React, { useState, useEffect } from "react";

interface BusinessIntegrationItem {
  id: string;
  requirement_id: string;
  requirement_title: string;
  category: string;
  priority: string;
  status: string;
  implementation_notes: string;
  quartermaster_tool_feature: string;
  cost_reduction_impact: number;
  created_at: string;
}

export default function BusinessIntegrationPage() {
  const [data, setData] = useState<BusinessIntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessIntegrationItem | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    requirement_id: "",
    requirement_title: "",
    category: "Business",
    priority: "P1",
    status: "Active",
    implementation_notes: "",
    quartermaster_tool_feature: "",
    cost_reduction_impact: 0
  });

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch("/api/business-integration");
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
    item.requirement_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = data.length;
  const activeItems = data.filter(item => item.status === "Active").length;
  const businessCategory = data.filter(item => item.category === "Business").length;
  const totalCostReduction = data.reduce((sum, item) => sum + item.cost_reduction_impact, 0);

  function resetForm() {
    setFormData({
      requirement_id: "",
      requirement_title: "",
      category: "Business",
      priority: "P1",
      status: "Active",
      implementation_notes: "",
      quartermaster_tool_feature: "",
      cost_reduction_impact: 0
    });
    setEditingItem(null);
    setShowForm(false);
    setError("");
    setFieldErrors({});
    setSuccess("");
  }

  function handleEdit(item: BusinessIntegrationItem) {
    setEditingItem(item);
    setFormData({
      requirement_id: item.requirement_id,
      requirement_title: item.requirement_title,
      category: item.category,
      priority: item.priority,
      status: item.status,
      implementation_notes: item.implementation_notes,
      quartermaster_tool_feature: item.quartermaster_tool_feature,
      cost_reduction_impact: item.cost_reduction_impact
    });
    setShowForm(true);
    setError("");
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    
    const errors: Record<string, string> = {};
    if (!formData.requirement_id.trim()) errors.requirement_id = "Requirement ID is required";
    if (!formData.requirement_title.trim()) errors.requirement_title = "Requirement title is required";
    if (!formData.implementation_notes.trim()) errors.implementation_notes = "Implementation notes are required";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem 
        ? { id: editingItem.id, ...formData }
        : formData;

      const res = await fetch("/api/business-integration", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Save failed");
      }

      setSuccess(editingItem ? "Updated successfully!" : "Created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this requirement?")) return;
    
    try {
      setSaving(true);
      const res = await fetch("/api/business-integration", {
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

  function getStatusBadge(status: string) {
    const colors = {
      "Active": "bg-green-100 text-green-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      "Completed": "bg-blue-100 text-blue-800",
      "On Hold": "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  }

  function getPriorityBadge(priority: string) {
    const colors = {
      "P1": "bg-red-100 text-red-800",
      "P2": "bg-yellow-100 text-yellow-800",
      "P3": "bg-green-100 text-green-800"
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Business Integration Requirements</h1>
          <p className="text-gray-600">Manage business objectives, cost reduction initiatives, and integration constraints for Troop 719 Inventory System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                📋
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                <p className="text-gray-600 text-sm">Total Requirements</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                ✅
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeItems}</p>
                <p className="text-gray-600 text-sm">Active Items</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                🎯
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{businessCategory}</p>
                <p className="text-gray-600 text-sm">Business Category</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                💰
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${totalCostReduction}</p>
                <p className="text-gray-600 text-sm">Cost Reduction Impact</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Requirements Management</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search requirements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                disabled={saving}
              >
                ➕ Add Requirement
              </button>
            </div>
          </div>

          {showForm && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? "Edit Requirement" : "Add New Requirement"}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirement ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.requirement_id}
                    onChange={(e) => setFormData({...formData, requirement_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., BUS-002"
                  />
                  {fieldErrors.requirement_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.requirement_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Business">Business</option>
                    <option value="Integration">Integration</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirement Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.requirement_title}
                    onChange={(e) => setFormData({...formData, requirement_title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the requirement"
                  />
                  {fieldErrors.requirement_title && <p className="text-red-500 text-xs mt-1">{fieldErrors.requirement_title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="P1">P1 - Critical</option>
                    <option value="P2">P2 - High</option>
                    <option value="P3">P3 - Medium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quartermaster Tool Feature
                  </label>
                  <input
                    type="text"
                    value={formData.quartermaster_tool_feature}
                    onChange={(e) => setFormData({...formData, quartermaster_tool_feature: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Related tool feature"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Reduction Impact ($)
                  </label>
                  <input
                    type="number"
                    value={formData.cost_reduction_impact}
                    onChange={(e) => setFormData({...formData, cost_reduction_impact: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Implementation Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.implementation_notes}
                    onChange={(e) => setFormData({...formData, implementation_notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed implementation notes and considerations"
                  />
                  {fieldErrors.implementation_notes && <p className="text-red-500 text-xs mt-1">{fieldErrors.implementation_notes}</p>}
                </div>

                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : (editingItem ? "Update Requirement" : "Create Requirement")}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>

                {error && <p className="text-red-500 text-sm mt-2 md:col-span-2">{error}</p>}
                {success && <p className="text-green-600 text-sm mt-2 md:col-span-2">{success}</p>}
              </form>
              <p className="text-xs text-gray-400 mt-2"><span className="text-red-500">*</span> Required fields</p>
            </div>
          )}

          {filteredData.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No requirements yet</h3>
              <p className="text-gray-600 mb-6">Create your first business requirement to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ Add First Requirement
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Impact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.requirement_id}</div>
                          <div className="text-sm text-gray-600">{item.requirement_title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${item.cost_reduction_impact}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={saving}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={saving}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
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
      </div>
    </div>
  );
}