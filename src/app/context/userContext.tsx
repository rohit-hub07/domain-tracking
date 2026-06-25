"use client"

import axios from "axios"
import React, { useContext, createContext, useState, useEffect } from "react"
import toast from "react-hot-toast"

export type LoginTypes = {
  email:string,
  password: string
}
export type SignupTypes = {
  username: string,
  email: string,
  password: string
}

interface IUser {
  userId: string | null,
  refreshUser: () => Promise<any>
  logout: () => Promise<any>,
  login: (credential: LoginTypes) => Promise<any>,
  signup: (userCredentials: SignupTypes) => Promise<any>
  loading: boolean
}


const Authcontext = createContext<IUser | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/user/me", {
        withCredentials: true
      });

      if (res.data.success) {
        setUserId(res.data.id || null)
        
      }
    } catch (error) {

      setUserId(null)

    } finally {
      setLoading(false)
    }
  }

  const login = async ({email, password}: LoginTypes): Promise<void> => {
    setLoading(true);

    try {
      const response = await axios.post('/api/user/login', { email, password }, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("response inside of auth context login: ", response.data)

      if (response.data.success) {
        const userData = response.data.user?._id;
        setUserId(userData);

        toast.success(response.data.message || 'Login successful!');
        return response.data
      }
    } catch (error: any) {
      setUserId(null);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({username, email, password}: SignupTypes): Promise<void> => {
    try {
      setLoading(true)

      const response = await axios.post("/api/user/signup", { username, email, password }, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      })
      console.log("response inside of auth context signup: ", response.data)

      if (response.data.success) {
        setUserId(response.data.userData._id);
        toast.success(response.data.message || 'Signup successful!');
        return response.data.userData
      }
      

    } catch (error:any) {
      setUserId(null);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false)
    }
  }
  const logout = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/user/logout",{ withCredentials: true })

      if (response.data.success) {
        setUserId(null)
        toast.success(response.data.message || "Logged out!");
      }
    } catch (error) {
      setUserId(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <Authcontext.Provider value={{ userId,refreshUser, logout, login, signup,loading, }}>
      {children}
    </Authcontext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(Authcontext);
  if(!context){
    throw new Error("useAuth must be defined withing AuthProvider");
  }
  return context;
}

