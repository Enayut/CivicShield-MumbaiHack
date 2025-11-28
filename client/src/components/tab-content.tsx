"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTabStore } from '@/stores/tabStore'

export function TabContent() {
  const { tabs, activeTabId } = useTabStore()
  
  const activeTab = tabs.find(tab => tab.id === activeTabId)
  
  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center w-full p-8 bg-background/30">
        <div className="text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <h2 className="text-xl font-semibold text-text-800 dark:text-text-200 mb-2">
            Welcome to CivicShield AI
          </h2>
          <p className="text-text-600 dark:text-text-400">
            Select a page from the sidebar to get started with election monitoring
          </p>
        </div>
      </div>
    )
  }
  
  const Component = activeTab.component
  
  return (
    <div className="flex-1 w-full overflow-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTabId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="w-full h-full"
        >
          <Component />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
