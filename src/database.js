let mongoose = require('mongoose');
class Database {
    constructor() {
        this._connect()
    }
    _connect() {
        mongoose.connect('mongodb://electron-admin:m00lah123!@ds113454.mlab.com:13454/electron', { useNewUrlParser: true })
            .then(() => {
                console.log('Database connection successful')
            })
            .catch(err => {
                console.log({err});
                console.error('Database connection error')
            })
    }
    disconnect() {
        console.log('disconnecting mongoose')
        mongoose.disconnect();
    }
}
module.exports = new Database()