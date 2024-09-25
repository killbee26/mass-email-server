require('dotenv').config(); // Add this line at the top of the file

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const cors = require('cors'); // Import cors package
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.DB_URL, { // Use the environment variable
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Use Routes
app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
