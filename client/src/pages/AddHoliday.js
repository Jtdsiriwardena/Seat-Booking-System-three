import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddHoliday.css';
import logo from './images/logo.png';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser, faPlusCircle, faClipboardList, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const AddHoliday = () => {
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
    const [filteredHolidays, setFilteredHolidays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/holidays`);
            const now = new Date();
            const validHolidays = response.data.filter(holiday => new Date(holiday.date) >= now);
            setFilteredHolidays(validHolidays);
        } catch (error) {
            setError('Failed to fetch holidays. Please try again later.');
            console.error('Error fetching holidays:', error.response ? error.response.data : error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (new Date(date) < new Date()) {
            alert('Cannot select a past date for a holiday.');
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/holidays`, { date, reason });
            setSuccess('Holiday added successfully!');
            setDate('');
            setReason('');
            fetchHolidays();
        } catch (error) {
            setError('Failed to add holiday. Please try again.');
            console.error('Error adding holiday:', error.response ? error.response.data : error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/holidays/${id}`);
            setSuccess('Holiday deleted successfully!');
            fetchHolidays(); 
        } catch (error) {
            setError('Failed to delete holiday. Please try again.');
            console.error('Error deleting holiday:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="add-holiday-container-unique">
               <aside className="ad-sidebar-unique">
    <img src={logo} alt="logo" className="ad-sidebar-logo-unique" />
    <nav className="ad-sidebar-nav-unique">
        <Link to="/admin" className="ad-sidebar-link-unique">
            <FontAwesomeIcon icon={faClipboardList} className="ad-sidebar-icon" />
            Bookings
        </Link>
        <Link to="/interns" className="ad-sidebar-link-unique">
            <FontAwesomeIcon icon={faUser} className="ad-sidebar-icon" />
            Interns
        </Link>
        <Link to="/add-holiday" className={`px-4 py-2 rounded-tr-full rounded-br-full transition-colors duration-200 ${window.location.pathname === '/add-holiday' ? 'bg-blue-600 text-white' : 'hover:bg-slate-600 hover:text-white'}`}>
            <FontAwesomeIcon icon={faPlusCircle} className="ad-sidebar-icon" />
            Add Holiday
        </Link>
        <Link to="/attendance" className="ad-sidebar-link-unique">
            <FontAwesomeIcon icon={faCalendar} className="ad-sidebar-icon" />
            Daily Attendance
        </Link>
        <Link to="/intern-attendance" className="ad-sidebar-link-unique">
            <FontAwesomeIcon icon={faClipboardList} className="ad-sidebar-icon" />
            Intern Attendance
        </Link>
    </nav>
    <button className="ad-sidebar-logout-button-unique">
        <FontAwesomeIcon icon={faSignOutAlt} className="ad-sidebar-icon" />
        Log Out
    </button>
</aside>
            <div className="add-holiday-content-unique">
                <h1>Holidays</h1>
                <form onSubmit={handleSubmit} className="add-holiday-form-unique">
                    <label htmlFor="date">Date:</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                    <label htmlFor="reason">Reason:</label>
                    <textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                    <button type="submit" className="add-holiday-submit-button-unique">Add Holiday</button>
                </form>

                {success && <p className="add-holiday-success-message-unique">{success}</p>}
                {error && <p className="add-holiday-error-message-unique">{error}</p>}
                {loading && <p className="add-holiday-loading-message-unique">Loading holidays...</p>}

                {filteredHolidays.length > 0 ? (
                    <table className="add-holiday-table-unique">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Reason</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHolidays.map((holiday) => (
                                <tr key={holiday._id}>
                                    <td>{new Date(holiday.date).toLocaleDateString()}</td>
                                    <td>{holiday.reason}</td>
                                    <td>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(holiday._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No holidays found.</p>
                )}
            </div>
        </div>
    );
};

export default AddHoliday;
