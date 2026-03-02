import React, { useState, useEffect } from 'react';
import { FaBox, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaExclamationTriangle, FaTruck, FaCalendarAlt, FaChartBar, FaBell, FaWarehouse, FaTag, FaDollarSign, FaArrowUp, FaArrowDown, FaTimes, FaCheck } from 'react-icons/fa';

function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    quantity: 0,
    minStock: 10,
    unit: 'pieces',
    purchasePrice: 0,
    sellingPrice: 0,
    supplier: '',
    location: '',
    expiryDate: '',
    status: 'active'
  });

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: 'Net 30',
    status: 'active'
  });

  const categories = ['Medicine', 'Equipment', 'Supplies', 'Consumables', 'PPE', 'Lab Supplies'];
  const statuses = ['active', 'inactive', 'discontinued'];
  const units = ['pieces', 'boxes', 'bottles', 'packs', 'kg', 'liters', 'meters'];

  // Load data from localStorage
  useEffect(() => {
    const storedItems = localStorage.getItem('inventoryItems');
    const storedSuppliers = localStorage.getItem('suppliers');
    
    if (storedItems) setItems(JSON.parse(storedItems));
    if (storedSuppliers) setSuppliers(JSON.parse(storedSuppliers));
    else initializeSampleData();
    
    setIsLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (items.length > 0) localStorage.setItem('inventoryItems', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (suppliers.length > 0) localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  // Check for low stock and expiring items
  useEffect(() => {
    const lowStock = items.filter(item => 
      item.quantity <= item.minStock && item.status === 'active'
    );
    setLowStockAlerts(lowStock);

    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiring = items.filter(item => 
      item.expiryDate && 
      new Date(item.expiryDate) <= thirtyDaysFromNow && 
      item.status === 'active'
    );
    setExpiringItems(expiring);
  }, [items]);

  const initializeSampleData = () => {
    const sampleSuppliers = [
      {
        id: 1,
        name: 'MediSupply Corp',
        contact: 'John Smith',
        email: 'john@medisupply.com',
        phone: '+1-234-567-8901',
        address: '123 Medical St, City, State 12345',
        taxId: 'TX-123456789',
        paymentTerms: 'Net 30',
        status: 'active'
      },
      {
        id: 2,
        name: 'HealthCare Solutions',
        contact: 'Sarah Johnson',
        email: 'sarah@healthcare.com',
        phone: '+1-234-567-8902',
        address: '456 Health Ave, City, State 67890',
        taxId: 'TX-987654321',
        paymentTerms: 'Net 15',
        status: 'active'
      }
    ];
    setSuppliers(sampleSuppliers);

    const sampleItems = [
      {
        id: 1,
        name: 'Paracetamol 500mg',
        sku: 'MED-001',
        category: 'Medicine',
        description: 'Pain relief medication',
        quantity: 150,
        minStock: 50,
        unit: 'bottles',
        purchasePrice: 2.50,
        sellingPrice: 5.99,
        supplier: 'MediSupply Corp',
        location: 'Pharmacy-A',
        expiryDate: '2024-12-31',
        status: 'active',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Surgical Gloves',
        sku: 'PPE-001',
        category: 'PPE',
        description: 'Disposable surgical gloves',
        quantity: 500,
        minStock: 200,
        unit: 'boxes',
        purchasePrice: 15.00,
        sellingPrice: 25.00,
        supplier: 'HealthCare Solutions',
        location: 'Storage-B',
        expiryDate: '2025-06-30',
        status: 'active',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Blood Pressure Monitor',
        sku: 'EQP-001',
        category: 'Equipment',
        description: 'Digital blood pressure monitoring device',
        quantity: 8,
        minStock: 5,
        unit: 'pieces',
        purchasePrice: 45.00,
        sellingPrice: 89.99,
        supplier: 'MediSupply Corp',
        location: 'Equipment-Room',
        expiryDate: '',
        status: 'active',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Bandages',
        sku: 'SUP-001',
        category: 'Supplies',
        description: 'Medical adhesive bandages',
        quantity: 15,
        minStock: 50,
        unit: 'boxes',
        purchasePrice: 8.50,
        sellingPrice: 15.99,
        supplier: 'HealthCare Solutions',
        location: 'Storage-A',
        expiryDate: '2024-08-15',
        status: 'active',
        lastUpdated: new Date().toISOString()
      }
    ];
    setItems(sampleItems);
  };

  const handleAddItem = () => {
    const item = {
      ...newItem,
      id: Date.now(),
      lastUpdated: new Date().toISOString()
    };
    setItems([...items, item]);
    setShowAddItemModal(false);
    resetNewItem();
  };

  const handleUpdateItem = () => {
    const updatedItems = items.map(item => 
      item.id === selectedItem.id 
        ? { ...selectedItem, lastUpdated: new Date().toISOString() }
        : item
    );
    setItems(updatedItems);
    setShowEditItemModal(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleAddSupplier = () => {
    const supplier = {
      ...newSupplier,
      id: Date.now()
    };
    setSuppliers([...suppliers, supplier]);
    setShowAddSupplierModal(false);
    resetNewSupplier();
  };

  const handleUpdateSupplier = () => {
    const updatedSuppliers = suppliers.map(supplier => 
      supplier.id === selectedSupplier.id ? selectedSupplier : supplier
    );
    setSuppliers(updatedSuppliers);
    setShowEditSupplierModal(false);
    setSelectedSupplier(null);
  };

  const handleDeleteSupplier = (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(supplier => supplier.id !== id));
    }
  };

  const resetNewItem = () => {
    setNewItem({
      name: '',
      sku: '',
      category: '',
      description: '',
      quantity: 0,
      minStock: 10,
      unit: 'pieces',
      purchasePrice: 0,
      sellingPrice: 0,
      supplier: '',
      location: '',
      expiryDate: '',
      status: 'active'
    });
  };

  const resetNewSupplier = () => {
    setNewSupplier({
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      paymentTerms: 'Net 30',
      status: 'active'
    });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getTotalValue = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getLowStockCount = () => {
    return items.filter(item => item.quantity <= item.minStock && item.status === 'active').length;
  };

  const getExpiringCount = () => {
    return expiringItems.length;
  };

  const getCategoryDistribution = () => {
    const distribution = {};
    items.forEach(item => {
      distribution[item.category] = (distribution[item.category] || 0) + 1;
    });
    return Object.entries(distribution).map(([category, count]) => ({ category, count }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FaWarehouse className="text-3xl text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-sm text-gray-500">Manage stock, suppliers, and track inventory</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaBell className="text-xl text-gray-600 cursor-pointer" />
                {(lowStockAlerts.length > 0 || expiringItems.length > 0) && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {lowStockAlerts.length + expiringItems.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Alert Banners */}
        {(lowStockAlerts.length > 0 || expiringItems.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {lowStockAlerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Low Stock Alert</h3>
                    <p className="text-red-600">{lowStockAlerts.length} items need restocking</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {lowStockAlerts.slice(0, 3).map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-red-600">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {expiringItems.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-yellow-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">Expiring Items</h3>
                    <p className="text-yellow-600">{expiringItems.length} items expiring soon</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {expiringItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-yellow-600">{item.expiryDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Items</p>
                <p className="text-3xl font-bold text-blue-600">{items.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaBox className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Quantity</p>
                <p className="text-3xl font-bold text-green-600">{getTotalItems()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaBox className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-purple-600">${getTotalValue().toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaDollarSign className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Suppliers</p>
                <p className="text-3xl font-bold text-orange-600">{suppliers.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <FaTruck className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['inventory', 'suppliers', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('All');
                    setFilterStatus('All');
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  <FaPlus className="inline mr-2" />
                  Add Item
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selling Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${
                              item.quantity <= item.minStock ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {item.quantity} {item.unit}
                            </span>
                            {item.quantity <= item.minStock && (
                              <FaExclamationTriangle className="ml-2 text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.minStock} {item.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.purchasePrice}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.sellingPrice}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.supplier}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.expiryDate || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.status === 'active' ? 'bg-green-100 text-green-800' :
                            item.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowEditItemModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <button
                onClick={() => setShowAddSupplierModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <FaPlus className="inline mr-2" />
                Add Supplier
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Terms</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suppliers.map(supplier => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-sm text-gray-500">Tax ID: {supplier.taxId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.contact}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.paymentTerms}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            supplier.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {supplier.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setShowEditSupplierModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Inventory Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-semibold">{items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Quantity:</span>
                    <span className="font-semibold">{getTotalItems()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-semibold">${getTotalValue().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
                <div className="space-y-3">
                  {getCategoryDistribution().map(cat => (
                    <div key={cat.category} className="flex justify-between items-center">
                      <span className="text-gray-600">{cat.category}:</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(cat.count / items.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold">{cat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Alerts Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Low Stock Items:</span>
                    <span className="font-semibold text-red-600">{getLowStockCount()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expiring Items:</span>
                    <span className="font-semibold text-yellow-600">{getExpiringCount()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Suppliers:</span>
                    <span className="font-semibold text-green-600">{suppliers.filter(s => s.status === 'active').length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Reports */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Detailed Inventory Report</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Until Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map(item => {
                      const daysUntilExpiry = item.expiryDate ? 
                        Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 
                        null;
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.quantity} {item.unit}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.quantity > item.minStock ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.quantity > item.minStock ? 'Adequate' : 'Low Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">${item.purchasePrice}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            ${(item.quantity * item.purchasePrice).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {daysUntilExpiry !== null ? (
                              <span className={daysUntilExpiry <= 30 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                              </span>
                            ) : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Item</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                  <input
                    type="number"
                    value={newItem.minStock}
                    onChange={(e) => setNewItem({...newItem, minStock: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.purchasePrice}
                    onChange={(e) => setNewItem({...newItem, purchasePrice: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.sellingPrice}
                    onChange={(e) => setNewItem({...newItem, sellingPrice: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newItem.location}
                    onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newItem.status}
                    onChange={(e) => setNewItem({...newItem, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={selectedItem.name}
                    onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={selectedItem.quantity}
                    onChange={(e) => setSelectedItem({...selectedItem, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditItemModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateItem}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Supplier</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newSupplier.contact}
                    onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSupplier}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Add Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryManagement;