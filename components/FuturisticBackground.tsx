'use client'

import React from 'react'

const FuturisticBackground: React.FC = () => {
  return (
    <>
      {/* Radial gradient background matching screenshot style with blue tones */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 90% 50%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
            #020817
          `
        }}
      />

      {/* Architectural background grid */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden architectural-grid opacity-50"></div>
      
      {/* Subtle geometric elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Large geometric background elements */}
        <div className="absolute top-20 right-1/4 w-2 h-2 bg-blue-400/20 rotate-45"></div>
        <div className="absolute bottom-32 left-1/3 w-1 h-20 bg-blue-400/10"></div>
        <div className="absolute top-1/2 left-20 w-20 h-1 bg-blue-400/10"></div>
        <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-blue-400/30 rotate-45"></div>
        
        {/* Subtle flowing lines for sections only */}
        <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="subtleLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0"/>
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="1"/>
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          <path d="M0,400 Q600,350 1200,400" stroke="url(#subtleLineGradient)" strokeWidth="1" fill="none">
            <animate attributeName="d" 
              values="M0,400 Q600,350 1200,400;M0,420 Q600,370 1200,420;M0,400 Q600,350 1200,400" 
              dur="20s" repeatCount="indefinite"/>
          </path>
        </svg>
      </div>
    </>
  )
}

export default FuturisticBackground