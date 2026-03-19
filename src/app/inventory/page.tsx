"use client";

import React, { useState, useEffect } from "react";

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  bin_number: number;
  quantity_total: number;
  quantity_available: number;
  status: string;
  qr_code: string;
  description?: string;
  created_at: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    bin_number: 1,
    quantity_total: 0,
    quantity_available: 0,
    status: "available",
    description: ""
  });
  
  // Error handling
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  
  const equipmentTypes = [
    "4-man tent", "2-man tent", "Gold Line", "Jetboil", "Stovehead", 
    "Fuel Bottle", "Cook Kit", "Platypus Water Filter", "Dromedary", 
    "First Aid Kit", "Water Bucket", "Radio", "Altimeter Watch",
    "Tent Stakes", "Rainfly", "Tent Poles"
  ];
  
  async function fetchData() {
    try {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data = await res.json();
      setItems(data);
      setFilteredItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    
    // Validate required fields
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.type.trim()) errors.type = "Type is required";
    if (formData.quantity_total < 0) errors.quantity_total = "Total quantity must be 0 or greater";
    if (formData.quantity_available < 0) errors.quantity_available = "Available quantity must be 0 or greater";
    if (formData.quantity_available > formData.quantity_total) errors.quantity_available = "Available quantity cannot exceed total quantity";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    try {
      setSaving(true);
      const qrCode = `INV-${Date.now()}`;
      const payload = { ...formData, qr_code: qrCode };
      
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem ? { ...payload, id: editingItem.id } : payload;
      
      const res = await fetch("/api/inventory", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Save failed");
      }
      
      setSuccess(editingItem ? "Updated successfully!" : "Added successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchData();
      setShowForm(false);
      setEditingItem(null);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }
  
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      setSaving(true);
      const res = await fetch("/api/inventory", {
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
  
  function resetForm() {
    setFormData({
      name: "",
      type: "",
      bin_number: 1,
      quantity_total: 0,
      quantity_available: 0,
      status: "available",
      description: ""
    });
  }
  
  function openEditForm(item: InventoryItem) {
    setFormData({
      name: item.name,
      type: item.type,
      bin_number: item.bin_number,
      quantity_total: item.quantity_total,
      quantity_available: item.quantity_available,
      status: item.status,
      description: item.description || ""
    });
    setEditingItem(item);
    setShowForm(true);
  }
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity_total, 0);
  const availableItems = items.reduce((sum, item) => sum + item.quantity_available, 0);
  const deployedItems = totalItems - availableItems;
  const uniqueTypes = new Set(items.map(item => item.type)).size;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📦 Inventory Management</h1>
          <button
            onClick={() => { setShowForm(true); setEditingItem(null); resetForm(); }}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            ➕ Add New Item
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-sm font-medium text-gray-500">Total Items</div>
            <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-sm font-medium text-gray-500">Available</div>
            <div className="text-2xl font-bold text-green-600">{availableItems}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-sm font-medium text-gray-500">Deployed</div>
            <div className="text-2xl font-bold text-yellow-600">{deployedItems}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-sm font-medium text-gray-500">Equipment Types</div>
            <div className="text-2xl font-bold text-blue-600">{uniqueTypes}</div>
          </div>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">
              {editingItem ? "Edit Item" : "Add New Item"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select equipment type</option>
                  {equipmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {fieldErrors.type && <p className="text-red-500 text-xs mt-1">{fieldErrors.type}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bin Number <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.bin_number}
                  onChange={(e) => setFormData({ ...formData, bin_number: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>Bin 1</option>
                  <option value={2}>Bin 2</option>
                  <option value={3}>Bin 3</option>
                  <option value={4}>Bin 4</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity_total}
                  onChange={(e) => setFormData({ ...formData, quantity_total: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {fieldErrors.quantity_total && <p className="text-red-500 text-xs mt-1">{fieldErrors.quantity_total}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity_available}
                  onChange={(e) => setFormData({ ...formData, quantity_available: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {fieldErrors.quantity_available && <p className="text-red-500 text-xs mt-1">{fieldErrors.quantity_available}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="deployed">Deployed</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 mb-4"><span className="text-red-500">*</span> Required fields</p>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }}
                    disabled={saving}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
              </div>
            </form>
          </div>
        )}
        
        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No inventory items yet</h3>
            <p className="text-gray-600 mb-6">Create your first inventory item to get started tracking equipment</p>
            <button
              onClick={() => { setShowForm(true); setEditingItem(null); resetForm(); }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              ➕ Add First Item
            </button>
          </div>
        )}
        
        {/* Data Table */}
        {filteredItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">Bin {item.bin_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {item.quantity_available} / {item.quantity_total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'available' ? 'bg-green-100 text-green-800' :
                          item.status === 'deployed' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'maintenance' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                        {item.qr_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openEditForm(item)}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}