'use client'
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { redirect } from 'next/navigation'

export default function Signup() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState('')
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function HandleSubmit(e) {
    e.preventDefault()


    const query = `
    mutation Signup($username: String!, $email: String!, $password: String!) {
      signup(username: $username, email: $email, password: $password)
    }
  `;

    const variables = { username, email, password };


    try {

      if (confirmPassword != password) {
        setError("Password is not match.")
        return
      }

      const res = await fetch(`http://localhost:3000/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query, variables })
      })

      const data = await res.json()
      const form = e.target

      if (data.error) {
        throw new Error(data.errors[0].message)
      } else {
        if (data.data.signup) {
          setError("")
          setSuccess("Complete to signup")
          form.reset()
        } else {
          setError("User already exist")
          setSuccess("")
          form.reset()
        }

      }

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Sign Up</h2>

        <form className="space-y-4" onSubmit={HandleSubmit}>
          {error && (
            <div className='text-sm text-white text-center py-1 px-3 rounded-md mt-2 bg-red-500 w-fit mx-auto'>
              {error}
            </div>
          )}

          {success && (
            <div className='text-sm text-white text-center py-1 px-3 rounded-md mt-2 bg-green-500 w-fit mx-auto'>
              {success}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-600">Username</label>
            <input
              type="text"
              id="_username"
              name="username"
              placeholder="Enter your username"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              id="_password"
              name="password"
              placeholder="Enter your password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Confirm Password</label>
            <input
              type="password"
              id="_password"
              name="password"
              placeholder="Confirm your password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              id="_email"
              name="email"
              placeholder="Enter your email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl transition duration-200"
            >
              Submit
            </button>
            <Link href={'/'} className="text-center text-blue-500 hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
