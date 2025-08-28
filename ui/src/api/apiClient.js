import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export default apiClient;

//http://127.0.0.1:3000/api
//https://learngauge.onrender.com/api
