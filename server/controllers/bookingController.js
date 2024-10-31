const Booking = require('../models/Booking');
const Intern = require('../models/Intern');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');


exports.bookSeat = async (req, res) => {
    const { date, seatNumber, specialRequest } = req.body;
    
    try {
      
        const existingBooking = await Booking.findOne({ date, seatNumber });
        if (existingBooking) {
            return res.status(400).json({ message: 'Seat already booked for this date.' });
        }

  
        const booking = new Booking({ intern: req.internId, date, seatNumber, specialRequest });
        await booking.save();

    
        const intern = await Intern.findById(req.internId);
        if (!intern) {
            return res.status(404).json({ message: 'Intern not found' });
        }

      
        await sendConfirmationEmail(intern, booking);

     
        res.status(201).json({ message: 'Seat booked successfully', booking });
    } catch (error) {
        console.error('Error booking seat:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



const sendConfirmationEmail = async (intern, booking) => {
    try {
       
        const qrData = `Booking Details:\nIntern ID: ${intern.internID}\nName: ${intern.firstName} ${intern.lastName}\nSeat Number: ${booking.seatNumber}\nDate: ${new Date(booking.date).toLocaleDateString()}`;
        const qrCodeImage = await QRCode.toDataURL(qrData);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_APP_PASSWORD 
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: intern.email,
            subject: 'Seat Booking Confirmation',
            html: `
                <p>Hello ${intern.firstName},</p>
                <p>Your seat booking is confirmed!</p>
                <p><strong>Booking Details:</strong></p>
                <ul>
                    <li>Seat Number: ${booking.seatNumber}</li>
                    <li>Date: ${new Date(booking.date).toLocaleDateString()}</li>
                    <li>Special Request: ${booking.specialRequest || 'None'}</li>
                </ul>
                <p>You can download and save the attached QR code to display upon arrival. Our admins can scan this QR code to view your booking details.</p>
                <p>Thank you for booking with us!</p>
                <p>Best Regards,<br>Sri Lanka Telecom</p>
            `,
            attachments: [
                {
                    filename: 'booking_qr_code.png',
                    content: qrCodeImage.split("base64,")[1],
                    encoding: 'base64'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log('Confirmation email with QR code sent to:', intern.email);
    } catch (error) {
        console.error('Error sending confirmation email with QR code:', error);
    }
};



exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ intern: req.internId }).populate('intern');
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const { date } = req.query;

        
        let query = {};
        if (date) {
            query.date = new Date(date);
        }

       
        const allBookings = await Booking.find(query).populate('intern', 'internID firstName lastName email');
        
        res.json(allBookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



const ConfirmBooking = require('../models/confirmBooking');



exports.confirmBooking = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findById(bookingId).populate('intern');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.isConfirmed = true;
        await booking.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: booking.intern.email,
            subject: 'Seat Booking Confirmation',
            text: `Dear ${booking.intern.firstName},\n\nYour booking for seat number ${booking.seatNumber} on ${new Date(booking.date).toLocaleDateString()} has been confirmed.\n\nBest Regards,\nSri Lanka Telecom PLC`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Confirmation email sent:', info.response);
            }
        });

        res.json({ message: 'Booking confirmed and email sent' });
    } catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.getConfirmedBookings = async (req, res) => {
    try {
        const confirmedBookings = await ConfirmBooking.find().populate('intern', 'internID firstName lastName email');
        res.json(confirmedBookings);
    } catch (error) {
        console.error('Error fetching confirmed bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findByIdAndDelete(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ message: 'Booking canceled successfully' });
    } catch (error) {
        console.error('Error canceling booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};




exports.updateAttendance = async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        await booking.save();

        res.json({ message: 'Attendance updated successfully' });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getInternAttendance = async (req, res) => {
    const { internId } = req.params;
    const { startDate, endDate } = req.query;

    try {
        const query = { intern: internId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const attendanceRecords = await Booking.find(query).populate('intern', 'firstName lastName internID');
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching intern attendance', error });
    }
};



