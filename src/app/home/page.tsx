"use client"

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useAuth } from "../context/userContext";
// import { useAuth } from "./context/userContext";



export default function Page() {
  const router = useRouter();
  // const [ userId, setUserId ] = useState<string>("");
  const {userId,loading} = useAuth();


  

  useEffect(() => {
    if (!loading) {
      // Redirect based on authentication status
      if (userId) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }
  }, [userId, loading, router]);

  // Show loading state while checking authentication
  <h1>Userid: {userId}</h1>
  return (
    <>
      <h1>UserId: {userId}</h1>
    </>
  );
}