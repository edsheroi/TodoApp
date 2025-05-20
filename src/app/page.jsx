'use client'
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { redirect } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function Home() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter();

  async function HandleSubmit(e) {
    e.preventDefault()

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      console.log(res)
      if (res.error) {
        throw new Error('Failed to login')
      } else {
        router.replace("/todolist")
      }

    } catch (error) {
      console.log('Failed to login', error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login to Your Account</h2>

        <form className="space-y-4" onSubmit={HandleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-600">Username</label>
            <input
              type="text"
              id="username"
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
              id="password"
              name="password"
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl transition duration-200"
            >
              Sign In
            </button>
            <Link href={'/signup'} className="text-center text-blue-500 hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
