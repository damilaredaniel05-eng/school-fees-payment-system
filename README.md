# School Fees Payment System

A comprehensive web application for managing student school fees payments online with receipt generation capabilities.

## Features

✅ **Student Authentication**
- Secure user registration and login
- Password encryption with bcryptjs
- JWT token-based authentication

✅ **Dashboard**
- Real-time fees overview (paid, unpaid, total)
- Quick payment initiation
- Payment history tracking

✅ **Online Payment Processing**
- Integrated with Paystack payment gateway
- Secure payment initialization and verification
- Payment status tracking

✅ **Receipt Generation**
- Automatic receipt generation after successful payment
- PDF download capability
- Receipt history tracking

✅ **Admin Panel**
- Manage student records
- Add and track fees
- View payment statistics
- Monitor all transactions

✅ **User Profile Management**
- Student profile viewing and updates
- Contact information management

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Authentication**: JWT (JSON Web Tokens)
- **Password Encryption**: bcryptjs
- **Payment Gateway**: Paystack
- **PDF Generation**: html2pdf

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/damilaredaniel05-eng/school-fees-payment-system.git
   cd school-fees-payment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup PostgreSQL Database**
   ```sql
   CREATE DATABASE school_fees_db;
   ```

4. **Configure environment**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` and add your configuration:
     - Database credentials
     - JWT secret
     - Paystack API keys (from https://paystack.com)

5. **Start the server**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:5000`

6. **Access the application**
   - Open `http://localhost:5000` in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login

### Students
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile

### Fees
- `GET /api/fees` - Get student fees
- `GET /api/fees/summary` - Get fees summary

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Admin
- `GET /api/admin/students` - Get all students
- `POST /api/admin/fees` - Add fees for student
- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/stats` - Get payment statistics

## Getting Paystack API Keys

1. Go to https://dashboard.paystack.com
2. Sign up or log in
3. Navigate to Settings → API Keys & Webhooks
4. Copy your Public Key and Secret Key
5. Add them to your `.env` file

## Database Schema

### users
- id (PRIMARY KEY)
- email (UNIQUE)
- password
- role (student, admin)
- created_at

### students
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- first_name
- last_name
- student_id (UNIQUE)
- class
- parent_email
- phone
- created_at

### fees
- id (PRIMARY KEY)
- student_id (FOREIGN KEY)
- amount
- due_date
- description
- status (paid, unpaid)
- created_at

### payments
- id (PRIMARY KEY)
- student_id (FOREIGN KEY)
- fee_id (FOREIGN KEY)
- amount
- payment_method
- transaction_ref
- status (pending, completed, failed)
- payment_date
- created_at

### receipts
- id (PRIMARY KEY)
- payment_id (FOREIGN KEY)
- receipt_number (UNIQUE)
- generated_at

## File Structure

```
school-fees-payment-system/
├── db/
│   └── database.js           # Database initialization and connection
├── middleware/
│   └── auth.js               # Authentication middleware
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── students.js           # Student routes
│   ├── fees.js               # Fees routes
│   ├── payments.js           # Payment routes
│   └── admin.js              # Admin routes
├── public/
│   ├── index.html            # Main HTML file
│   ├── styles.css            # Styling
│   └── app.js                # Frontend JavaScript
├── server.js                 # Main server file
├── package.json              # Dependencies
├── .env.example              # Environment variables template
└── README.md                 # Documentation
```

## Usage

### Student Workflow
1. Register a new account or login
2. View dashboard with fees overview
3. Click "Pay" on unpaid fees
4. Complete payment via Paystack
5. Download receipt as PDF
6. View payment history

### Admin Workflow
1. Login with admin credentials
2. View all students and payments
3. Add new fees for students
4. Monitor payment statistics

## Security Considerations

- All passwords are hashed using bcryptjs
- JWT tokens for secure authentication
- CORS enabled for cross-origin requests
- Environment variables for sensitive data
- Paystack handles PCI DSS compliance for payments

## Error Handling

The application includes comprehensive error handling:
- Database connection errors
- Authentication failures
- Payment processing errors
- Validation errors

## Future Enhancements

- [ ] Email notifications for payment confirmations
- [ ] SMS reminders for due fees
- [ ] Multi-payment gateway support
- [ ] Advanced reporting and analytics
- [ ] Mobile app version
- [ ] Recurring payment setup
- [ ] Partial payment support

## Support

For issues and questions, please open an issue on GitHub.

## License

MIT License - See LICENSE file for details

## Author

School Fees Payment System

## Disclaimer

This is a development version. Ensure proper security measures and testing before deploying to production.
