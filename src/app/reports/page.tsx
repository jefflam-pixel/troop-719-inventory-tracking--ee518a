"use client";
import React, { useState, useEffect } from "react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  status: string;
  location: string;
  condition: string;
  created_at: string;
}

interface CheckoutRecord {
  id: string;
  equipment_id: string;
  equipment_name: string;
  scout_name: string;
  checkout_date: string;
  return_date?: string;
  status: string;
  created_at: string;
}

interface ConditionReport {
  id: string;
  equipment_id: string;
  equipment_name: string;
  condition: string;
  notes: string;
  inspector: string;
  inspection_date: string;
  created_at: string;
}

interface ReportsData {
  inventory: InventoryItem[];
  checkouts: CheckoutRecord[];
  conditions: ConditionReport[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData>({ inventory: [], checkouts: [], conditions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReport, setEditingReport] = useState<ConditionReport | null>(null);
  const [activeTab, setActiveTab] = useState("inventory");
  
  // Form fields for condition reports
  const [equipmentId, setEquipmentId] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [inspector, setInspector] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch("/api/reports");
      if (!response.ok) {
        throw new Error("Failed to fetch reports data");
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEquipmentId("");
    setEquipmentName("");
    setCondition("");
    setNotes("");
    setInspector("");
    setInspectionDate("");
    setEditingReport(null);
    setShowAddForm(false);
  };

  const openEditForm = (report: ConditionReport) => {
    setEquipmentId(report.equipment_id);
    setEquipmentName(report.equipment_name);
    setCondition(report.condition);
    setNotes(report.notes);
    setInspector(report.inspector);
    setInspectionDate(report.inspection_date);
    setEditingReport(report);
    setShowAddForm(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    
    const errors: Record<string, string> = {};
    if (!equipmentId.trim()) errors.equipmentId = "Equipment ID is required";
    if (!equipmentName.trim()) errors.equipmentName = "Equipment name is required";
    if (!condition.trim()) errors.condition = "Condition is required";
    if (!inspector.trim()) errors.inspector = "Inspector name is required";
    if (!inspectionDate.trim()) errors.inspectionDate = "Inspection date is required";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    try {
      setSaving(true);
      const payload = {
        equipment_id: equipmentId,
        equipment_name: equipmentName,
        condition,
        notes,
        inspector,
        inspection_date: inspectionDate
      };
      
      const method = editingReport ? "PUT" : "POST";
      const body = editingReport ? { ...payload, id: editingReport.id } : payload;
      
      const res = await fetch("/api/reports", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Save failed");
      }
      
      setSuccess(editingReport ? "Report updated successfully!" : "Report created successfully!");
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
    if (!confirm("Are you sure you want to delete this condition report?")) return;
    
    try {
      setSaving(true);
      const res = await fetch("/api/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      
      if (!res.ok) throw new Error("Delete failed");
      
      setSuccess("Report deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // Calculate stats
  const totalInventory = data.inventory.length;
  const availableItems = data.inventory.filter(item => item.status === "available").length;
  const checkedOutItems = data.inventory.filter(item => item.status === "checked_out").length;
  const missingItems = data.checkouts.filter(checkout => checkout.status === "overdue" || (checkout.status === "active" && !checkout.return_date)).length;
  const poorConditionItems = data.conditions.filter(report => report.condition === "poor" || report.condition === "damaged").length;

  // Filter functions
  const filteredInventory = data.inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredCheckouts = data.checkouts.filter(checkout =>
    checkout.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkout.scout_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredConditions = data.conditions.filter(report =>
    report.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.inspector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Troop 719 Reports & Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive inventory status and condition reporting</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalInventory}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{availableItems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">📤</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Checked Out</p>
                <p className="text-2xl font-bold text-yellow-600">{checkedOutItems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Missing</p>
                <p className="text-2xl font-bold text-red-600">{missingItems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <span className="text-2xl">🔧</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Poor Condition</p>
                <p className="text-2xl font-bold text-orange-600">{poorConditionItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("inventory")}
                className={`py-4 px-6 text-sm font-medium ${activeTab === "inventory" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                📦 Inventory Status
              </button>
              <button
                onClick={() => setActiveTab("missing")}
                className={`py-4 px-6 text-sm font-medium ${activeTab === "missing" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                ⚠️ Missing Items
              </button>
              <button
                onClick={() => setActiveTab("conditions")}
                className={`py-4 px-6 text-sm font-medium ${activeTab === "conditions" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                🔧 Condition Reports
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {activeTab === "conditions" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ➕ Add Condition Report
                </button>
              )}
            </div>

            {/* Inventory Status Tab */}
            {activeTab === "inventory" && (
              <div>
                {filteredInventory.length === 0 && !loading ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">📦</span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No inventory items found</h3>
                    <p className="text-gray-600">No items match your search criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInventory.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.status === "available" ? "bg-green-100 text-green-800" :
                                item.status === "checked_out" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.condition === "excellent" ? "bg-green-100 text-green-800" :
                                item.condition === "good" ? "bg-blue-100 text-blue-800" :
                                item.condition === "fair" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {item.condition}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Missing Items Tab */}
            {activeTab === "missing" && (
              <div>
                {filteredCheckouts.filter(checkout => checkout.status === "overdue" || (checkout.status === "active" && !checkout.return_date)).length === 0 && !loading ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">✅</span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No missing items</h3>
                    <p className="text-gray-600">All equipment has been returned properly.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scout</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Outstanding</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCheckouts.filter(checkout => checkout.status === "overdue" || (checkout.status === "active" && !checkout.return_date)).map((checkout) => {
                          const checkoutDate = new Date(checkout.checkout_date);
                          const daysOut = Math.floor((Date.now() - checkoutDate.getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <tr key={checkout.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{checkout.equipment_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{checkout.scout_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(checkout.checkout_date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  checkout.status === "overdue" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {checkout.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{daysOut} days</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Condition Reports Tab */}
            {activeTab === "conditions" && (
              <div>
                {filteredConditions.length === 0 && !loading ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">🔧</span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No condition reports yet</h3>
                    <p className="text-gray-600 mb-4">Create your first condition report to track equipment status.</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ➕ Add Condition Report
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredConditions.map((report) => (
                          <tr key={report.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.equipment_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                report.condition === "excellent" ? "bg-green-100 text-green-800" :
                                report.condition === "good" ? "bg-blue-100 text-blue-800" :
                                report.condition === "fair" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {report.condition}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.inspector}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.inspection_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{report.notes}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => openEditForm(report)}
                                disabled={saving}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(report.id)}
                                disabled={saving}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                {saving ? "Deleting..." : "🗑️ Delete"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="mt-8 border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingReport ? "Edit Condition Report" : "Add New Condition Report"}
                </h3>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Equipment ID <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={equipmentId}
                      onChange={(e) => setEquipmentId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {fieldErrors.equipmentId && <p className="text-red-500 text-xs mt-1">{fieldErrors.equipmentId}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Equipment Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={equipmentName}
                      onChange={(e) => setEquipmentName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {fieldErrors.equipmentName && <p className="text-red-500 text-xs mt-1">{fieldErrors.equipmentName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Condition <span className="text-red-500">*</span></label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select condition</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="damaged">Damaged</option>
                    </select>
                    {fieldErrors.condition && <p className="text-red-500 text-xs mt-1">{fieldErrors.condition}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Inspector <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={inspector}
                      onChange={(e) => setInspector(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {fieldErrors.inspector && <p className="text-red-500 text-xs mt-1">{fieldErrors.inspector}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Inspection Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {fieldErrors.inspectionDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.inspectionDate}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes about the condition..."
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : editingReport ? "Update Report" : "Create Report"}
                    </button>
                  </div>
                </form>
                
                <p className="text-xs text-gray-400 mt-2"><span className="text-red-500">*</span> Required fields</p>
                
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}