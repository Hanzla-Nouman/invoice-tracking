// app/not-found.js
'use client'
import { useEffect } from 'react'

export default function NotFound() {
  useEffect(() => {
    document.body.style.backgroundColor = 'black'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div className="text-black text-center pt-[20vh]">
      <h1 className='text-[5rem] mb-4'>404</h1>
      <p>The page you requested doesn't exist</p>
   
    </div>
  )
}