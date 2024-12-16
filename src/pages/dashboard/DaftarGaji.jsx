import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardBody, CardHeader, Typography, Button } from "@material-tailwind/react";
import { PencilIcon, TrashIcon, PrinterIcon } from "@heroicons/react/24/solid";
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

const DaftarGaji = () => {
  const [gaji, setGaji] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [gajiAmount, setGajiAmount] = useState('');
  const [periode, setPeriode] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = 'https://api-pharmacy.silendas.my.id/api';
  const token = localStorage.getItem('authToken');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchEmployees();
    fetchGaji();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees`, { headers });
      setEmployees(response.data || []);
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const fetchGaji = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/salaries`, { headers });
      setGaji(response.data || []);
    } catch (error) {
      toast.error('Failed to load salaries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const salaryData = { amount: gajiAmount, period: periode, payment_date: paymentDate, employee_id: selectedEmployeeId };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/salaries/${editingId}`, salaryData, { headers });
        toast.success('Salary updated successfully');
      } else {
        await axios.post(`${API_URL}/salaries`, salaryData, { headers });
        toast.success('Salary added successfully');
      }
      await fetchGaji();
      resetForm();
    } catch (error) {
      toast.error('Failed to save salary');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGajiAmount('');
    setPeriode('');
    setPaymentDate('');
    setSelectedEmployeeId('');
    setEditingId(null);
  };

  const handleEdit = (salary) => {
    setEditingId(salary.id);
    setGajiAmount(salary.amount);
    setPeriode(salary.period);
    setPaymentDate(salary.payment_date);
    setSelectedEmployeeId(salary.employee_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this salary?')) {
      try {
        await axios.delete(`${API_URL}/salaries/${id}`, { headers });
        toast.success('Salary deleted successfully');
        await fetchGaji();
      } catch (error) {
        toast.error('Failed to delete salary');
      }
    }
  };

  const generatePDF = (salary) => {
    const doc = new jsPDF();
  
    // Header Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('SLIP GAJI', 105, 20, { align: 'center' });
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('[NAMA PT]', 20, 30);
    doc.text('Alamat PT', 20, 36);
    doc.line(20, 40, 190, 40); // Horizontal line
  
    // Employee Details
    doc.text('Periode:', 140, 30);
    doc.text(salary.period || '[Periode]', 170, 30, { align: 'right' });
    doc.text('Nama Karyawan:', 140, 36);
    doc.text(salary.Employee?.name || '[Nama Karyawan]', 170, 36, { align: 'right' });
    doc.text('Jabatan:', 140, 42);
    doc.text(salary.Employee?.position || '[Jabatan]', 170, 42, { align: 'right' });
    doc.text('Status:', 140, 48);
    doc.text(salary.Employee?.status || '[Status]', 170, 48, { align: 'right' });
    doc.text('PTKP:', 140, 54);
    doc.text(salary.Employee?.ptkp || '[PTKP]', 170, 54, { align: 'right' });
  
    // Penerimaan Section
    let y = 60;
    doc.setFont('helvetica', 'bold');
    doc.text('PENERIMAAN', 20, y);
    y += 6;
  
    doc.setFont('helvetica', 'normal');
    const earnings = [
      { label: 'Gaji Pokok', value: salary.earnings?.find(e => e.label === 'Gaji Pokok')?.value || 0 },
      { label: 'Tunjangan Jabatan', value: salary.earnings?.find(e => e.label === 'Tunjangan Jabatan')?.value || 0 },
      { label: 'Tunjangan Transportasi', value: salary.earnings?.find(e => e.label === 'Tunjangan Transportasi')?.value || 0 },
      { label: 'Tunjangan Makan', value: salary.earnings?.find(e => e.label === 'Tunjangan Makan')?.value || 0 },
      { label: 'Lembur', value: salary.earnings?.find(e => e.label === 'Lembur')?.value || 0 },
      { label: 'Bonus / THR', value: salary.earnings?.find(e => e.label === 'Bonus / THR')?.value || 0 },
    ];
  
    let totalEarnings = 0;
    earnings.forEach((item) => {
      doc.text(`- ${item.label}`, 20, y);
      doc.text(`Rp. ${item.value.toLocaleString('id-ID')}`, 170, y, { align: 'right' });
      totalEarnings += item.value;
      y += 6;
    });
  
    doc.setFont('helvetica', 'bold');
    doc.text('Total Penghasilan Bruto', 20, y);
    doc.text(`Rp. ${totalEarnings.toLocaleString('id-ID')}`, 170, y, { align: 'right' });
    y += 6;
  
    // Pengurangan Section
    const deductions = [
      { label: 'Tabungan Koperasi', value: salary.deductions?.find(d => d.label === 'Tabungan Koperasi')?.value || 0 },
    ];
  
    let totalDeductions = 0;
    deductions.forEach((item) => {
      doc.text(`${item.label}`, 20, y);
      doc.text(`Rp. ${item.value.toLocaleString('id-ID')}`, 170, y, { align: 'right' });
      totalDeductions += item.value;
      y += 6;
    });
  
    doc.setFont('helvetica', 'bold');
    doc.text('Penerima Bersih', 20, y);
    const netSalary = totalEarnings - totalDeductions;
    doc.text(`Rp. ${netSalary.toLocaleString('id-ID')}`, 170, y, { align: 'right' });
    y += 10;
  
    // Terbilang Section
    doc.setFont('helvetica', 'normal');
    doc.text('Terbilang :', 20, y);
    y += 10;
  
    // Footer
    y += 10;
    const currentDate = new Date();
    doc.text(`Kota, ${currentDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, y);
    y += 6;
  
    doc.text('Penerima', 20, y);
    doc.text('[Nama Perusahaan]', 170, y, { align: 'right' });
    y += 20;
  
    doc.text('[Nama Karyawan]', 20, y);
    doc.text('[Nama HRD Payroll]', 170, y, { align: 'right' });
  
    // Save the PDF
    doc.save(`Slip-Gaji-${salary.Employee?.name || 'N/A'}.pdf`);
  };
  
  
  
  return (
    <>
      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">Salary Data</Typography>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium">Employee</label>
              <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded" required>
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
              <div>
                <label className="block text-sm font-medium">Salary</label>
                <input type="number" value={gajiAmount} onChange={(e) => setGajiAmount(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Period</label>
                <input 
                  type="month" 
                  value={periode} 
                  onChange={(e) => setPeriode(e.target.value)} 
                  className="w-full p-2 mt-1 border border-gray-300 rounded" 
                  placeholder="e.g., January 2024" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Payment Date</label>
                <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded" required />
              </div>
            </div>

            <div className="mt-4 text-center">
              <Button type="submit" className="bg-blue-600 text-white">{editingId ? 'Update' : 'Save'}</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-20">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">Salary Data List</Typography>
        </CardHeader>
        <CardBody>
          {loading ? <div className="text-center">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Employee ID</th>
                    <th className="px-4 py-2 text-left">Nama</th>
                    <th className="px-4 py-2 text-left">Salary</th>
                    <th className="px-4 py-2 text-left">Period</th>
                    <th className="px-4 py-2 text-left">Payment Date</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gaji.length > 0 ? gaji.map((salary) => (
                    <tr key={salary.id}>
                      <td className="px-4 py-2">{salary.employee_id}</td>
                      <td className="px-4 py-2">{salary.Employee.name}</td>
                      <td className="px-4 py-2">{salary.amount}</td>
                      <td className="px-4 py-2">{salary.period}</td>
                      <td className="px-4 py-2">{salary.payment_date}</td>
                      <td className="px-4 py-2">
                        <Button onClick={() => handleEdit(salary)} className="bg-yellow-500 text-white p-2">
                          <PencilIcon className="h-5 w-5" />
                        </Button>
                        <Button onClick={() => handleDelete(salary.id)} className="bg-red-600 text-white p-2 ml-2">
                          <TrashIcon className="h-5 w-5" />
                        </Button>
                        <Button onClick={() => generatePDF(salary)} className="bg-green-500 text-white p-2 ml-2">
                          <PrinterIcon className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="text-center px-4 py-2">No salary data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default DaftarGaji;
