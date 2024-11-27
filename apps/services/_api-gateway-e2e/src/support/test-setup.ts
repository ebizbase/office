import axios from 'axios';

module.exports = async function () {
  axios.defaults.baseURL = 'http://127.0.0.1:3000';
};
