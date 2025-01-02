import axios from 'axios';

module.exports = async function () {
  axios.defaults.validateStatus = () => true;
};
