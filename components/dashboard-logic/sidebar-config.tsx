"use client";
 
import { useState } from "react";
import Sidebar from "./sidebar";

export default function SideBarVisivility() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
        return (
            <div className="flex min-h-screen bg-[#f4f8ff]">
                <div className="flex-1 flex flex-col min-w-0">
                    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-[#DBEBFF] lg:hidden">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="flex items-center justify-center p-2 rounded-lg text-[#223966] hover:bg-[#DBEBFF] transition-colors"
                            aria-label="Abrir menú"
                        >
                            {/* Ícono hamburguesa */}
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </header>
        
                </div>
            </div>
        )
    }