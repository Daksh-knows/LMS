import Footer from '@/components/Footer'
import React from 'react'

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      {/* <Footer /> */}
    </div>
  )
}

export default layout