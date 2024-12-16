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

export function Costumer() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [nik, setNik] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null); // New state for alerts
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const API_URL = 'https://api-pharmacy.silendas.my.id/api';
  const token = localStorage.getItem('authToken') || '';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/customers`, { headers });
      setCustomers(response.data || []);
      setFilteredCustomers(response.data || []);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to fetch customers' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(value) ||
      customer.nik.toLowerCase().includes(value)
    );
    setFilteredCustomers(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const customerData = {
      nik,
      name,
      phone,
      address,
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/customers/${editingId}`, customerData, { headers });
        setAlert({ type: 'success', message: 'Customer berhasil diupdate!' });
      } else {
        await axios.post(`${API_URL}/customers`, customerData, { headers });
        setAlert({ type: 'success', message: 'Customer berhasil ditambahkan!' });
      }
      await fetchCustomers();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal menyimpan customer';
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNik('');
    setName('');
    setPhone('');
    setAddress('');
    setEditingId(null);
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setNik(customer.nik);
    setName(customer.name);
    setPhone(customer.phone);
    setAddress(customer.address);
  };

  const openModal = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setDeleteId(null);
    setShowModal(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/customers/${deleteId}`, { headers });
      setAlert({ type: 'success', message: 'Customer berhasil dihapus!' });
      await fetchCustomers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal menghapus Costumer';
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      closeModal();
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
        <CardHeader variant="gradient" color="gray" className="mb-8 p-8">
          <Typography variant="h6" color="white">
            Information Customer
          </Typography>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">NIK</label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan NIK"
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
                <label className="block text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan No Telepon"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded"
                  placeholder="Masukan Alamat"
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

      {/* Customer Table */}
      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">
              Customer Table
            </Typography>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              className="p-2 border border-gray-300 rounded text-black"
              placeholder="Search by NIK or Name"
            />
          </div>
        </CardHeader>
        <CardBody>
          {loading && (
            <div className="flex justify-center items-center">
              <div className="spinner-border text-blue-500" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-center">
              <thead>
                <tr>
                  <th className="p-2">No</th>
                  <th className="p-2">NIK</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Address</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map((customer, index) => (
                    <tr key={customer.id} className="border-b">
                      <td className="p-2">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                      <td className="p-2">{customer.nik}</td>
                      <td className="p-2">{customer.name}</td>
                      <td className="p-2">{customer.phone}</td>
                      <td className="p-2">{customer.address}</td>
                      <td className="p-2">
                        <Button
                          onClick={() => handleEdit(customer)}
                          color="lime"
                          size="sm"
                          className="mr-2"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Button>
                        <Button
                          onClick={() => openModal(customer.id)}
                          color="red"
                          size="sm"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-5 flex justify-end items-end">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-500 text-white mx-2"
            >
              Previous
            </Button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, index) => (
              <Button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`mx-1 ${currentPage === index + 1 ? 'bg-lime-500 text-black' : 'bg-black'}`}
              >
                {index + 1}
              </Button>
            ))}

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-black text-white mx-2"
            >
              Next
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="text-center">
              <Typography variant="h6">Pakah anda yakin ingin menghapus data costumer?</Typography>
              <div className="mt-4 flex justify-center">
                <Button onClick={closeModal} className="mr-2" color="gray">Batal</Button>
                <Button onClick={handleDelete} color="red">Hapus</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default Costumer;
