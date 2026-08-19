import React, { useState, useEffect } from 'react';

export const AIChat = ()=>{
    return(
         <div className="bg-blue-600 rounded-2xl p-6 text-white mb-8 shadow-lg flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">AI Recommendation</h2>
            <p className="opacity-90">Based on current trends, Space C is your best bet for a quick park!</p>
          </div>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold">Ask AI</button>
        </div>
    )
}