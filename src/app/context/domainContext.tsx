"use client"

import axios from "axios";
import React, { useContext, createContext, useState } from "react"
import toast from "react-hot-toast";

export type ParamType = {
  params: Promise<{id: string}> 
}

interface Idomain {
  addDomain: (name : string) => Promise<any>;
  deleteDomain: (id: string) => Promise<void>;
  showAllDomain: () => Promise<any>;
  loading: boolean;
}


const DomainContext = createContext<Idomain | null>(null);

export const DomainProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false)

  const addDomain = async (name: string) => {
    try {
      setLoading(true);
      console.log("name inside of add domain: ",name);
      const response = await axios.post("/api/domain/create",{ domain: name }, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      })
      console.log("response inside of adddomain context: ", response)
      // const data = response.data;
      if (response?.data?.success) {
        toast.success(response.data.message)
        return response.data;
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add domain");
    } finally {
      setLoading(false)
    }
  }
  const deleteDomain = async (id: string): Promise<void> => {
    try {
      setLoading(true)
      const response = await axios.delete(`/api/domain/delete/${id}`, {
        withCredentials: true,
      });
      if(response.data.success){
        toast.success(response.data.message)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete domain")
    } finally {
      setLoading(false)
    }
  }
  
  const showAllDomain = async() => {
    try {
      const response = await axios.get("/api/domain/show",{withCredentials: true})
      if(response.data.success){
        // toast.success(response.data.message)
        return response.data
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch domains")
    } finally{
      setLoading(false)
    }
  }

  return (
    <DomainContext.Provider value={{addDomain, deleteDomain, showAllDomain, loading}}>
      {children}
    </DomainContext.Provider>
  )
}

export const useDomain = () =>{
  const context = useContext(DomainContext);
  if(!context){
    throw new Error("useDomain must be defined within DomainProvider");
  }
  return context;
}