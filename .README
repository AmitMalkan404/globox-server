# Globox Server

## Overview
Globox Server is the backend for the Globox application, providing essential APIs and services for managing and tracking packages efficiently. This project is built using **Node.js** and incorporates **Express.js** for server-side functionality. The backend integrates with external APIs for advanced package tracking capabilities and stores data using **Firebase**.

---

## Features
- **Package Management**: Add, update, and delete package information.
- **API Integration**: Fetch package status from external services.
- **Data Storage**: Save user and package data securely in Firebase.
- **Error Handling**: Robust error-handling mechanisms to ensure reliability.
- **Logging**: Detailed logs for debugging and tracking activities.

---

## Installation

### Prerequisites
Ensure you have the following installed:
- **Firebase CLI** (to manage and deploy Firebase projects)
- **Node.js** (v16 or later)
- **npm** (Node Package Manager)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/AmitMalkan404/globox-server.git
   cd globox-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the environment variables:
   Create a `.env` file in the root directory and set the required variables:
   ```env
   PORT=3000
   FIREBASE_CONFIG=your-firebase-config
   API_KEY=your-api-key
   JWT_SECRET=your-jwt-secret
   ```

   Replace `your-firebase-config` with the Firebase configuration JSON.

4. Start the server:
   ```bash
   npm start
   ```

5. Access the application:
   Open your browser and navigate to `http://localhost:3000`.

---

## API Endpoints

### **Authentication**
- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Log in and receive a JWT.

### **Packages**
- `GET /packages`: Retrieve all packages.
- `POST /packages`: Add a new package.
- `GET /packages/:id`: Get details of a specific package.
- `PUT /packages/:id`: Update package details.
- `DELETE /packages/:id`: Remove a package.

### **Tracking**
- `GET /tracking/:trackingId`: Get the tracking status of a package.

---

## Development
### Running in Development Mode
Use the following command for development with live reload:
```bash
npm run dev
```

### Linting
Ensure code quality with:
```bash
npm run lint
```

---

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add feature-name'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## Contact
For inquiries or support, please reach out to [Amit Malkan](mailto:amit.malkan404@example.com).
