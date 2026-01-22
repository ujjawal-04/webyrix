import { PricingTable } from '@clerk/nextjs'
import React from 'react'

function Pricing() {
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-[#121212]'>
      <h2 className='font-lg text-3xl my-5'>Pricing</h2>
      <div className='max-w-3xl w-full'>
        <PricingTable />
      </div>
    </div>
  )
}

export default Pricing
