const bcrypt = require('bcrypt');

const password = '@kku'; // Replace with your desired password
bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log('Hashed password:', hash);
});