import React, { useState } from "react";
import { useLogin } from "../../hooks/useLogin";
import Loader from "./../../utils/Loader";

export default function Login() {
  const { login, isLoading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col-reverse gap-7 lg:flex-row items-center justify-center w-full max-w-7xl">
        {/* Login Card */}
        <div className="bg-white p-8 lg:p-16 rounded-xl shadow-md w-full max-w-lg relative border-2 border-gray-600">
          <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-primary text-center">
            Login
          </h1>
          <form>
            {/* Email Field */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-primary font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-gray-500 hover:border-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-primary font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-gray-500 hover:border-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </form>

          {/* Login Button */}
          <button
            type="button"
            className="absolute bottom-4 right-4 bg-green-500 text-white py-2 px-8 rounded-lg hover:bg-green-700 transition duration-300"
            onClick={() => login(email, password)}
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : "Login"}
          </button>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        <img
          src="/images/logoo-removebg-preview.png"
          alt="Logo"
          className="w-full max-w-sm lg:w-[700px] h-auto hidden sm:block"
        />
      </div>
    </div>
  );
}
