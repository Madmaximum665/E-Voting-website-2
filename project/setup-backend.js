// This script provides instructions for setting up the MongoDB connection
console.log(`
=====================================================
BACKEND SETUP INSTRUCTIONS
=====================================================

The backend is failing to connect to MongoDB Atlas.
Follow these steps to fix it:

1. Create a .env file in the backend directory:
   cd ../backend
   touch .env

2. Add your MongoDB connection string to the .env file:
   echo "MONGODB_URI=mongodb+srv://username:password@your-cluster-url/election-db?retryWrites=true&w=majority" > .env
   
   Replace username, password, and your-cluster-url with your actual MongoDB Atlas credentials.

3. Add a JWT secret key for authentication:
   echo "JWT_SECRET=your_jwt_secret_key" >> .env

4. Restart the backend server:
   npm run dev

If you don't have a MongoDB Atlas account:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and set up a cluster
3. Get your connection string from the Connect dialog
4. Replace the placeholder in step 2 with your actual connection string

For local development, you can also use a local MongoDB instance:
MONGODB_URI=mongodb://localhost:27017/election-db
`); 