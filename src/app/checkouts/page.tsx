"use client";

import React, { useState, useEffect } from "react";

interface CheckoutType {
  id: string;
  scout_name: string;
  equipment_name: string;
  equipment_qr_code: string;
  checkout_date: string;
  return_date: string | null;
  status: string;
  trip_name: string;
  notes: string;
  created_at: string;
}

export default function CheckoutsPage() {
  const [checkouts, setCheckouts] = useState<CheckoutType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCheckout, setEditingCheckout] = useState<CheckoutType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // Form fields
  const [scoutName, setScoutName] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentQrCode, setEquipmentQrCode] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [status, setStatus] = useState("checked_out");
  const [tripName, setTripName] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetch("/api/checkouts");
      if (!response.ok) throw new Error("Failed to fetch checkouts");
      const data = await response.json();
      setCheckouts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load checkouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setScoutName("");
    setEquipmentName("");
    setEquipmentQrCode("");
    setCheckoutDate("");
    setReturnDate("");
    setStatus("checked_out");
    setTripName("");
    setNotes("");
    setEditingCheckout(null);
    setShowForm(false);
    setFieldErrors({});
    setError("");
    setSuccess("");
  };

  const openEditForm = (checkout: CheckoutType) => {
    setEditingCheckout(checkout);
    setScoutName(checkout.scout_name);
    setEquipmentName(checkout.equipment_name);
    setEquipmentQrCode(checkout.equipment_qr_code);
    setCheckoutDate(checkout.checkout_date.split('T')[0]);
    setReturnDate(checkout.return_date ? checkout.return_date.split('T')[0] : "");
    setStatus(checkout.status);
    setTripName(checkout.trip_name);
    setNotes(checkout.notes);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!scoutName.trim()) errors.scoutName = "Scout name is required";
    if (!equipmentName.trim()) errors.equipmentName = "Equipment name is required";
    if (!equipmentQrCode.trim()) errors.equipmentQrCode = "Equipment QR code is required";
    if (!checkoutDate.trim()) errors.checkoutDate = "Checkout date is required";
    if (!tripName.trim()) errors.tripName = "Trip name is required";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        scout_name: scoutName,
        equipment_name: equipmentName,
        equipment_qr_code: equipmentQrCode,
        checkout_date: checkoutDate,
        return_date: returnDate || null,
        status,
        trip_name: tripName,
        notes
      };

      const url = "/api/checkouts";
      const method = editingCheckout ? "PUT" : "POST";
      
      if (editingCheckout) {
        (payload as any).id = editingCheckout.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Save failed");
      }

      setSuccess(editingCheckout ? "Checkout updated successfully!" : "Checkout created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this checkout?")) return;
    
    try {
      setSaving(true);
      const res = await fetch("/api/checkouts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (!res.ok) throw new Error("Delete failed");
      
      setSuccess("Checkout deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const filteredCheckouts = checkouts.filter(checkout =>
    checkout.scout_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkout.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkout.trip_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCheckouts = checkouts.length;
  const checkedOutCount = checkouts.filter(c => c.status === "checked_out").length;
  const returnedCount = checkouts.filter(c => c.status === "returned").length;
  const overdueCount = checkouts.filter(c => c.status === "overdue").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Equipment Checkouts</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            disabled={saving}
          >
            📦 New Checkout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-sm font-medium text-gray-500 mb-2">Total Checkouts</div>
            <div className="text-3xl font-bold text-gray-900">{totalCheckouts}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-sm font-medium text-gray-500 mb-2">Checked Out</div>
            <div className="text-3xl font-bold text-orange-600">{checkedOutCount}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-sm font-medium text-gray-500 mb-2">Returned</div>
            <div className="text-3xl font-bold text-green-600">{returnedCount}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-sm font-medium text-gray-500 mb-2">Overdue</div>
            <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by scout name, equipment, or trip..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredCheckouts.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No checkouts yet</h3>
              <p className="text-gray-500 mb-6">Create your first equipment checkout to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create First Checkout
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scout</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCheckouts.map((checkout) => (
                    <tr key={checkout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{checkout.scout_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{checkout.equipment_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{checkout.equipment_qr_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{checkout.trip_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(checkout.checkout_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          checkout.status === 'returned' ? 'bg-green-100 text-green-800' :
                          checkout.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {checkout.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => openEditForm(checkout)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                          disabled={saving}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(checkout.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={saving}
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCheckout ? "Edit Checkout" : "New Equipment Checkout"}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scout Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={scoutName}
                      onChange={(e) => setScoutName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter scout's full name"
                    />
                    {fieldErrors.scoutName && <p className="text-red-500 text-xs mt-1">{fieldErrors.scoutName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={equipmentName}
                      onChange={(e) => setEquipmentName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Backpack, Tent, Sleeping Bag"
                    />
                    {fieldErrors.equipmentName && <p className="text-red-500 text-xs mt-1">{fieldErrors.equipmentName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment QR Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={equipmentQrCode}
                      onChange={(e) => setEquipmentQrCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      placeholder="Scan or enter QR code"
                    />
                    {fieldErrors.equipmentQrCode && <p className="text-red-500 text-xs mt-1">{fieldErrors.equipmentQrCode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trip Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Summer Camp 2024"
                    />
                    {fieldErrors.tripName && <p className="text-red-500 text-xs mt-1">{fieldErrors.tripName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Checkout Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={checkoutDate}
                      onChange={(e) => setCheckoutDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {fieldErrors.checkoutDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.checkoutDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="checked_out">Checked Out</option>
                      <option value="returned">Returned</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional notes or special instructions..."
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-4">
                  <span className="text-red-500">*</span> Required fields
                </p>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : editingCheckout ? "Update Checkout" : "Create Checkout"}
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