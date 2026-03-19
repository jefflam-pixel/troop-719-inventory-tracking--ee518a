"use client";

import React, { useState, useEffect } from "react";

interface ChainOfCustodyRecord {
  id: string;
  equipment_name: string;
  equipment_qr_code: string;
  scout_name: string;
  action_type: string;
  status: string;
  checkout_date: string;
  return_date?: string;
  condition_at_checkout: string;
  condition_at_return?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function ChainOfCustodyPage() {
  const [records, setRecords] = useState<ChainOfCustodyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ChainOfCustodyRecord | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // Form fields
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentQrCode, setEquipmentQrCode] = useState("");
  const [scoutName, setScoutName] = useState("");
  const [actionType, setActionType] = useState("checkout");
  const [status, setStatus] = useState("active");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [conditionAtCheckout, setConditionAtCheckout] = useState("good");
  const [conditionAtReturn, setConditionAtReturn] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/chain-of-custody");
      if (!res.ok) throw new Error("Failed to fetch records");
      const data = await res.json();
      setRecords(data || []);
    } catch (err: any) {
      setError("Failed to load chain of custody records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEquipmentName("");
    setEquipmentQrCode("");
    setScoutName("");
    setActionType("checkout");
    setStatus("active");
    setCheckoutDate("");
    setReturnDate("");
    setConditionAtCheckout("good");
    setConditionAtReturn("");
    setNotes("");
    setEditingRecord(null);
    setError("");
    setFieldErrors({});
    setSuccess("");
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (record: ChainOfCustodyRecord) => {
    setEditingRecord(record);
    setEquipmentName(record.equipment_name);
    setEquipmentQrCode(record.equipment_qr_code);
    setScoutName(record.scout_name);
    setActionType(record.action_type);
    setStatus(record.status);
    setCheckoutDate(record.checkout_date);
    setReturnDate(record.return_date || "");
    setConditionAtCheckout(record.condition_at_checkout);
    setConditionAtReturn(record.condition_at_return || "");
    setNotes(record.notes);
    setShowForm(true);
    setError("");
    setFieldErrors({});
    setSuccess("");
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!equipmentName.trim()) errors.equipmentName = "Equipment name is required";
    if (!equipmentQrCode.trim()) errors.equipmentQrCode = "Equipment QR code is required";
    if (!scoutName.trim()) errors.scoutName = "Scout name is required";
    if (!actionType.trim()) errors.actionType = "Action type is required";
    if (!checkoutDate.trim()) errors.checkoutDate = "Checkout date is required";
    if (!conditionAtCheckout.trim()) errors.conditionAtCheckout = "Condition at checkout is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        equipment_name: equipmentName,
        equipment_qr_code: equipmentQrCode,
        scout_name: scoutName,
        action_type: actionType,
        status: status,
        checkout_date: checkoutDate,
        return_date: returnDate || null,
        condition_at_checkout: conditionAtCheckout,
        condition_at_return: conditionAtReturn || null,
        notes: notes
      };

      const method = editingRecord ? "PUT" : "POST";
      const body = editingRecord ? { ...payload, id: editingRecord.id } : payload;

      const res = await fetch("/api/chain-of-custody", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Save failed");
      }

      setSuccess(editingRecord ? "Record updated successfully!" : "Record created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
      closeForm();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chain of custody record?")) return;

    try {
      setSaving(true);
      const res = await fetch("/api/chain-of-custody", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (!res.ok) throw new Error("Delete failed");

      setSuccess("Record deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const filteredRecords = records.filter(record =>
    record.equipment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.scout_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.equipment_qr_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRecords = records.length;
  const activeCheckouts = records.filter(r => r.status === "active").length;
  const returnedItems = records.filter(r => r.status === "returned").length;
  const overdueItems = records.filter(r => r.status === "overdue").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "returned": return "bg-blue-100 text-blue-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent": return "bg-green-100 text-green-800";
      case "good": return "bg-blue-100 text-blue-800";
      case "fair": return "bg-yellow-100 text-yellow-800";
      case "poor": return "bg-red-100 text-red-800";
      case "damaged": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⛓️ Chain of Custody</h1>
          <p className="text-gray-600">Digital audit trail for equipment usage and Scout accountability</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
                <p className="text-gray-600 text-sm">Total Records</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{activeCheckouts}</p>
                <p className="text-gray-600 text-sm">Active Checkouts</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{returnedItems}</p>
                <p className="text-gray-600 text-sm">Returned Items</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{overdueItems}</p>
                <p className="text-gray-600 text-sm">Overdue Items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by equipment, scout name, or QR code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={openAddForm}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              📝 Add New Record
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRecords.length === 0 && searchQuery === "" && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">⛓️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No chain of custody records yet</h3>
            <p className="text-gray-600 mb-6">Create your first record to start tracking equipment usage</p>
            <button
              onClick={openAddForm}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              📝 Create First Record
            </button>
          </div>
        )}

        {/* Records Table */}
        {filteredRecords.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scout</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.equipment_name}</div>
                          <div className="text-sm text-gray-500">{record.equipment_qr_code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.scout_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full capitalize">
                          {record.action_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>Out: {new Date(record.checkout_date).toLocaleDateString()}</div>
                          {record.return_date && <div>In: {new Date(record.return_date).toLocaleDateString()}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-xs">
                            <span className={`inline-flex px-2 py-1 rounded-full capitalize ${getConditionColor(record.condition_at_checkout)}`}>
                              Out: {record.condition_at_checkout}
                            </span>
                          </div>
                          {record.condition_at_return && (
                            <div className="text-xs mt-1">
                              <span className={`inline-flex px-2 py-1 rounded-full capitalize ${getConditionColor(record.condition_at_return)}`}>
                                In: {record.condition_at_return}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditForm(record)}
                            disabled={saving}
                            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            disabled={saving}
                            className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                          >
                            {saving ? "🔄 Deleting..." : "🗑️ Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRecord ? "✏️ Edit Record" : "📝 Add New Record"}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        placeholder="Enter equipment name"
                      />
                      {fieldErrors.equipmentName && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.equipmentName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        QR Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={equipmentQrCode}
                        onChange={(e) => setEquipmentQrCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Scan or enter QR code"
                      />
                      {fieldErrors.equipmentQrCode && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.equipmentQrCode}</p>
                      )}
                    </div>
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
                      placeholder="Enter scout name"
                    />
                    {fieldErrors.scoutName && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.scoutName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Action Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="checkout">Checkout</option>
                        <option value="return">Return</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inspection">Inspection</option>
                      </select>
                      {fieldErrors.actionType && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.actionType}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="returned">Returned</option>
                        <option value="overdue">Overdue</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Checkout Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={checkoutDate}
                        onChange={(e) => setCheckoutDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {fieldErrors.checkoutDate && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.checkoutDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition at Checkout <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={conditionAtCheckout}
                        onChange={(e) => setConditionAtCheckout(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="damaged">Damaged</option>
                      </select>
                      {fieldErrors.conditionAtCheckout && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.conditionAtCheckout}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition at Return</label>
                      <select
                        value={conditionAtReturn}
                        onChange={(e) => setConditionAtReturn(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select condition</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="damaged">Damaged</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes about condition, usage, or issues..."
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={closeForm}
                      disabled={saving}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {saving ? "🔄 Saving..." : editingRecord ? "💾 Update Record" : "📝 Create Record"}
                    </button>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    <span className="text-red-500">*</span> Required fields
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}