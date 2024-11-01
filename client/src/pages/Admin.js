import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';
import logo from './images/logo.png';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser, faPlusCircle, faClipboardList, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Admin = () => {
    const [bookings, setBookings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;
    const token = localStorage.getItem('token');

    const compareByConfirmation = (a, b) => {
        if (a.isConfirmed === b.isConfirmed) return 0;
        return a.isConfirmed ? 1 : -1;
    };

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/bookings/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const sortedBookings = response.data.sort(compareByConfirmation);
                setBookings(sortedBookings);
            } catch (error) {
                console.error('Error fetching bookings:', error.response ? error.response.data : error.message);
            }
        };

        fetchBookings();
    }, [token]);

    const confirmBooking = async (bookingId) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/bookings/${bookingId}/confirm`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Booking confirmed!');

            const updatedBookings = bookings.map(booking =>
                booking._id === bookingId ? { ...booking, isConfirmed: true } : booking
            ).sort(compareByConfirmation);

            setBookings(updatedBookings);
        } catch (error) {
            console.error('Error confirming booking:', error.response ? error.response.data : error.message);
            alert('Failed to confirm booking.');
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredBookings = bookings.filter(booking =>
        booking.intern &&
        (booking.intern.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.intern.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredBookings.slice(indexOfFirstRow, indexOfLastRow);

    const nextPage = () => {
        if (currentPage < Math.ceil(filteredBookings.length / rowsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="admin-container bg-gray-200 min-h-screen">
            <aside className="admin-sidebar">
                <img src={logo} alt="logo" className="admin-logo" />
                <nav className="admin-nav">
                    <Link to="/admin" className={`admin-link ${window.location.pathname === '/admin' ? 'active' : ''}`}>
                        <FontAwesomeIcon icon={faClipboardList} className="admin-icon" /> Bookings
                    </Link>
                    <Link to="/interns" className="admin-link">
                        <FontAwesomeIcon icon={faUser} className="admin-icon" /> Interns
                    </Link>
                    <Link to="/add-holiday" className="admin-link">
                        <FontAwesomeIcon icon={faPlusCircle} className="admin-icon" /> Add Holiday
                    </Link>
                    <Link to="/attendance" className="admin-link">
                        <FontAwesomeIcon icon={faCalendar} className="admin-icon" /> Daily Attendance
                    </Link>
                    <Link to="/intern-attendance" className="admin-link">
                        <FontAwesomeIcon icon={faClipboardList} className="admin-icon" /> Intern Attendance
                    </Link>
                </nav>
                <button className="admin-logout-btn">
                    <FontAwesomeIcon icon={faSignOutAlt} className="admin-icon" /> Log Out
                </button>
            </aside>

            <main className="admin-main p-6">
                <h1 className="text-2xl font-bold mb-4">Bookings</h1>

                <input
                    type="text"
                    placeholder="Search by First Name or Last Name"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input p-2 mb-4 border rounded w-full"
                />

                {currentRows.length > 0 ? (
                    <table className="table-auto bg-white shadow-lg rounded-lg w-full">
                        <thead>
                            <tr className="bg-blue-200">
                                <th className="table-header">Intern ID</th>
                                <th className="table-header">First Name</th>
                                <th className="table-header">Last Name</th>
                                <th className="table-header">Email</th>
                                <th className="table-header">Date</th>
                                <th className="table-header">Seat Number</th>
                                <th className="table-header">Special Request</th>
                                <th className="table-header">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-100">
                                    <td className="table-cell">{booking.intern ? booking.intern.internID : 'N/A'}</td>
                                    <td className="table-cell">{booking.intern ? booking.intern.firstName : 'N/A'}</td>
                                    <td className="table-cell">{booking.intern ? booking.intern.lastName : 'N/A'}</td>
                                    <td className="table-cell">{booking.intern ? booking.intern.email : 'N/A'}</td>
                                    <td className="table-cell">{new Date(booking.date).toLocaleDateString()}</td>
                                    <td className="table-cell">{booking.seatNumber}</td>
                                    <td className="table-cell">{booking.specialRequest || 'None'}</td>
                                    <td className="table-cell">
                                        <button
                                            className={`confirm-btn ${booking.isConfirmed ? 'bg-blue-500' : 'bg-green-500'}`}
                                            onClick={() => confirmBooking(booking._id)}
                                            disabled={booking.isConfirmed}
                                        >
                                            {booking.isConfirmed ? 'Confirmed' : 'Confirm'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-500">No bookings available</p>
                )}

                <div className="pagination-controls flex justify-between mt-4">
                    <button className="pagination-btn" onClick={prevPage} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <button className="pagination-btn" onClick={nextPage} disabled={currentPage === Math.ceil(filteredBookings.length / rowsPerPage)}>
                        Next
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Admin;
