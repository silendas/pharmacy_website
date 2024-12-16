import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

export function BarangMasuk() {
  const [inventory, setInventory] = useState([]);
  const [kode, setKode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [alert, setAlert] = useState(null); // New state for alerts
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
 

  const API_URL = 'https://api-pharmacy.silendas.my.id/api';
  const token = localStorage.getItem('authToken');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchInventory();
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees`, { headers });
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee:', error);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/inventories`, { headers });
      console.log('API Response:', response.data);
      setInventory(response.data || []);
    } catch (error) {
      console.error('Error details:', error.response || error);
      setError(error.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const inventoryData = {
      kode,
      name,
      price: parseInt(price),
      stock: parseInt(stock),
      employee_id: employee?.id
    };
  
    try {
      if (editingId) {
        await axios.put(`${API_URL}/inventories/${editingId}`, inventoryData, { headers });
        setAlert({ type: 'success', message: 'Barang berhasil di update!' });
      } else {
        await axios.post(`${API_URL}/inventories`, inventoryData, { headers });
        setAlert({ type: 'success', message: 'Barang berhasil ditambahkan!' });
      }
      await fetchInventory();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal Menyimpan Barang';
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
      setDeleteItemId(null); // Reset delete item id after successful submit
    }
  };
  

  const resetForm = () => {
    setKode('');
    setName('');
    setPrice('');
    setStock('');
    setEditingId(null);
  };

  const handleEdit = async (item) => {
    setEditingId(item.id);
    setKode(item.kode);
    setName(item.name);
    setPrice(item.price);
    setStock(item.stock);
  };

 

  const openModal = (id) => {
    setDeleteItemId(id);  // Set the item ID to be deleted
    setShowDeleteModal(true);  // Show the delete confirmation modal
  };
  
  const closeModal = () => {
    setDeleteItemId(null);  // Clear delete item ID when closing modal
    setShowDeleteModal(false);  // Close the modal
  };
  
  const handleDelete = async () => {
    if (!deleteItemId) return;  // Prevent deletion if there's no item ID
    try {
      await axios.delete(`${API_URL}/inventories/${deleteItemId}`, { headers });
      setAlert({ type: 'success', message: 'Barang berhasil dihapus!' });
      await fetchInventory();  // Refresh the inventory list
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal menghapus barang';
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      closeModal();  // Close the modal after deletion
    }
  };
  
  const handleSearch = () => {
    return inventory.filter(
      (item) =>
        item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = handleSearch().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(handleSearch().length / itemsPerPage);

  return (
    <>

     {/* Alert Message */}
          {alert && (
            <div
              className={`p-4 mb-4 text-sm rounded-md ${alert.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
            >
              <div className="flex justify-between items-center">
                <span>{alert.message}</span>
                <Button
                  size="sm"
                  className="bg-transparent text-white"
                  onClick={() => setAlert(null)} // Close alert manually
                >
                  X
                </Button>
              </div>
            </div>
          )}
      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Input Barang Masuk
          </Typography>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Kode</label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan Kode"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Nama</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan Nama"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan Harga"
                  required
                  prefix="Rp."
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Stok</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan Stok Barang"
                  required
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button type="submit" className="bg-black text-white">
                {editingId ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Tabel Barang Masuk
          </Typography>
        </CardHeader>
        <CardBody>
          {loading && <div className="text-center">Loading...</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}

          <div className="mb-8 flex items-center space-x-2">
  {/* Teks Cari Barang */}
  <span className="text-sm font-medium">Cari Barang:</span>

  {/* Input dengan Icon Search */}
  <div className="relative w-full">
    <input
      type="text"
      placeholder="Masukan nama atau kode"
      className="p-2 w-full pl-10 border border-gray-300 rounded"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    {/* Icon Search dari Heroicons */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm4.4-4.4l4.4 4.4"
      />
    </svg>
  </div>
</div>


          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-left">
              <thead>
                <tr>
                  <th className="p-2">Kode</th>
                  <th className="p-2">Nama</th>
                  <th className="p-2">Harga</th>
                  <th className="p-2">Stok</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.kode}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">Rp. {item.price}</td>
                    <td className="p-2">{item.stock}</td>
                    <td className="p-2">
                      <Button
                        color="lime"
                        size="sm"
                        className="mr-2"
                        onClick={() => handleEdit(item)}
                      >
                        <PencilIcon className="h-4 w-4 inline mr-1" /> 
                      </Button>
                      <Button
                        color="red"
                        size="sm"
                        onClick={() => {
                          setDeleteItemId(item.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        <TrashIcon className="h-4 w-4 inline mr-1" /> 
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-end items-end">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-500 text-white mx-2"
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, index) => (
              <Button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`mx-1 ${currentPage === index + 1 ? 'bg-lime-500 text-black' : 'bg-black'}`}
              >
                {index + 1}
              </Button>
            ))}

            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-black text-white mx-2"
            >
              Next
            </Button>
          </div>
        </CardBody>
      </Card>

      {showDeleteModal && (
  <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg w-96">
      <div className="text-center">
        <Typography variant="h6">Apakah anda yakin ingin menghapus barang?</Typography>
        <div className="mt-4 flex justify-center">
          <Button onClick={closeModal} className="mr-2" color="gray">Batal</Button>
          <Button onClick={handleDelete} className="ml-2" color="red">Hapus</Button>
        </div>
      </div>
    </div>
  </div>
)}


    </>
  );
}



export default BarangMasuk;
