import React, { useState, useEffect } from 'react';
import { 
  Database, Table, Plus, Edit, Trash2, Search, RefreshCw, 
  Download, Upload, CheckCircle, XCircle, AlertCircle,
  Users, FileText, Bell, Settings, Eye, Save
} from 'lucide-react';
import '../styles/AdminDashboard.css';

const DatabaseManager = () => {
  const [selectedTable, setSelectedTable] = useState('users');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  const tables = [
    { name: 'users', label: 'المستخدمون', icon: Users, color: '#8b5cf6' },
    { name: 'evaluations', label: 'التقييمات', icon: FileText, color: '#3b82f6' },
    { name: 'map_notifications', label: 'إشعارات الخريطة', icon: Bell, color: '#10b981' },
  ];

  useEffect(() => {
    fetchTableData();
  }, [selectedTable]);

  const fetchTableData = async () => {
    setLoading(true);
    try {
      const apiKey = localStorage.getItem('adminApiKey');
      const response = await fetch(`/api/admin/database/${selectedTable}`, {
        headers: {
          'x-api-key': apiKey
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setTableData(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditingRow({ ...row });
  };

  const handleSave = async () => {
    try {
      const apiKey = localStorage.getItem('adminApiKey');
      const response = await fetch(`/api/admin/database/${selectedTable}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          id: editingRow.id,
          updates: editingRow
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('تم التحديث بنجاح!');
        setEditingRow(null);
        fetchTableData();
      }
    } catch (error) {
      console.error('Error updating row:', error);
      alert('حدث خطأ أثناء التحديث');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;

    try {
      const apiKey = localStorage.getItem('adminApiKey');
      const response = await fetch(`/api/admin/database/${selectedTable}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.success) {
        alert('تم الحذف بنجاح!');
        fetchTableData();
      }
    } catch (error) {
      console.error('Error deleting row:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleAdd = async () => {
    try {
      const apiKey = localStorage.getItem('adminApiKey');
      const response = await fetch(`/api/admin/database/${selectedTable}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(newRow)
      });

      const data = await response.json();
      if (data.success) {
        alert('تم الإضافة بنجاح!');
        setShowAddForm(false);
        setNewRow({});
        fetchTableData();
      }
    } catch (error) {
      console.error('Error adding row:', error);
      alert('حدث خطأ أثناء الإضافة');
    }
  };

  const exportToCSV = () => {
    const headers = Object.keys(tableData[0] || {});
    const csvContent = [
      headers.join(','),
      ...tableData.map(row => 
        headers.map(header => JSON.stringify(row[header] || '')).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedTable}_${new Date().toISOString()}.csv`;
    link.click();
  };

  const filteredData = tableData.filter(row => {
    const searchLower = searchTerm.toLowerCase();
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchLower)
    );
  });

  const getTableColumns = () => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0]);
  };

  const renderCellValue = (value, column) => {
    if (value === null || value === undefined) return '-';
    if (column === 'created_at' || column === 'updated_at') {
      return new Date(value).toLocaleString('ar-SA');
    }
    if (column === 'email_verified') {
      return value ? (
        <span className="status-badge verified">
          <CheckCircle size={14} /> مُفعّل
        </span>
      ) : (
        <span className="status-badge pending">
          <XCircle size={14} /> غير مُفعّل
        </span>
      );
    }
    if (column === 'password_hash') {
      return '••••••••';
    }
    if (typeof value === 'number' && value > 1000) {
      return value.toLocaleString('ar-SA');
    }
    return String(value);
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <h1>🗄️ إدارة قاعدة البيانات</h1>
          <p>تحكم كامل بجميع البيانات</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchTableData}>
            <RefreshCw size={18} />
            تحديث
          </button>
          <button className="btn-export" onClick={exportToCSV}>
            <Download size={18} />
            تصدير CSV
          </button>
          <button 
            className="btn-export" 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ background: 'rgba(16, 185, 129, 0.95)' }}
          >
            <Plus size={18} />
            إضافة سجل جديد
          </button>
        </div>
      </div>

      {/* Tables Navigation */}
      <div className="tables-nav">
        {tables.map(table => (
          <button
            key={table.name}
            className={`table-nav-btn ${selectedTable === table.name ? 'active' : ''}`}
            onClick={() => {
              setSelectedTable(table.name);
              setShowAddForm(false);
              setEditingRow(null);
            }}
            style={{ 
              borderColor: selectedTable === table.name ? table.color : 'transparent',
              color: selectedTable === table.name ? table.color : '#6b7280'
            }}
          >
            <table.icon size={20} />
            <span>{table.label}</span>
            <span className="badge">{tableData.length}</span>
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="add-form-card">
          <h3>إضافة سجل جديد في {tables.find(t => t.name === selectedTable)?.label}</h3>
          <div className="form-grid">
            {getTableColumns().filter(col => col !== 'id' && col !== 'created_at' && col !== 'updated_at').map(column => (
              <div key={column} className="form-field">
                <label>{column}</label>
                <input
                  type={column.includes('email') ? 'email' : column.includes('password') ? 'password' : 'text'}
                  value={newRow[column] || ''}
                  onChange={(e) => setNewRow({ ...newRow, [column]: e.target.value })}
                  placeholder={`أدخل ${column}`}
                />
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={handleAdd}>
              <Save size={18} />
              حفظ
            </button>
            <button className="btn-cancel" onClick={() => {
              setShowAddForm(false);
              setNewRow({});
            }}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="ابحث في البيانات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="results-count">
          عرض {filteredData.length} من {tableData.length} سجل
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      ) : (
        <div className="table-section">
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  {getTableColumns().map(column => (
                    <th key={column}>{column}</th>
                  ))}
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={row.id || index}>
                    {getTableColumns().map(column => (
                      <td key={column}>
                        {editingRow && editingRow.id === row.id && column !== 'id' && column !== 'created_at' && column !== 'updated_at' ? (
                          <input
                            type="text"
                            value={editingRow[column] || ''}
                            onChange={(e) => setEditingRow({ ...editingRow, [column]: e.target.value })}
                            className="edit-input"
                          />
                        ) : (
                          renderCellValue(row[column], column)
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="action-buttons">
                        {editingRow && editingRow.id === row.id ? (
                          <>
                            <button className="btn-action view" onClick={handleSave}>
                              <Save size={14} /> حفظ
                            </button>
                            <button className="btn-action edit" onClick={() => setEditingRow(null)}>
                              إلغاء
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn-action view" onClick={() => handleEdit(row)}>
                              <Eye size={14} /> عرض
                            </button>
                            <button className="btn-action edit" onClick={() => handleEdit(row)}>
                              <Edit size={14} /> تعديل
                            </button>
                            <button className="btn-action delete" onClick={() => handleDelete(row.id)}>
                              <Trash2 size={14} /> حذف
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManager;

