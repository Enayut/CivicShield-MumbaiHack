import { create } from 'zustand'
import { LucideIcon } from 'lucide-react'

export interface Tab {
  id: string
  label: string
  href: string
  icon: LucideIcon
  isActive: boolean
  isDirty?: boolean
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab: Omit<Tab, 'isActive'>) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  closeAllTabs: () => void
  getTabById: (tabId: string) => Tab | undefined
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (newTab) => {
    const { tabs } = get()
    const existingTab = tabs.find(tab => tab.id === newTab.id)
    
    if (existingTab) {
      // If tab already exists, just activate it
      set((state) => ({
        tabs: state.tabs.map(tab => ({
          ...tab,
          isActive: tab.id === newTab.id
        })),
        activeTabId: newTab.id
      }))
    } else {
      // Add new tab and make it active
      set((state) => ({
        tabs: [
          ...state.tabs.map(tab => ({ ...tab, isActive: false })),
          { ...newTab, isActive: true }
        ],
        activeTabId: newTab.id
      }))
    }
  },

  removeTab: (tabId) => {
    const { tabs, activeTabId } = get()
    const tabIndex = tabs.findIndex(tab => tab.id === tabId)
    
    if (tabIndex === -1) return

    const newTabs = tabs.filter(tab => tab.id !== tabId)
    let newActiveTabId = activeTabId

    // If we're closing the active tab, determine which tab should be active next
    if (activeTabId === tabId && newTabs.length > 0) {
      if (tabIndex > 0) {
        // Activate the tab to the left
        newActiveTabId = newTabs[tabIndex - 1].id
      } else {
        // Activate the first tab
        newActiveTabId = newTabs[0].id
      }
    } else if (newTabs.length === 0) {
      newActiveTabId = null
    }

    set({
      tabs: newTabs.map(tab => ({
        ...tab,
        isActive: tab.id === newActiveTabId
      })),
      activeTabId: newActiveTabId
    })
  },

  setActiveTab: (tabId) => {
    set((state) => ({
      tabs: state.tabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      })),
      activeTabId: tabId
    }))
  },

  closeAllTabs: () => {
    set({
      tabs: [],
      activeTabId: null
    })
  },

  getTabById: (tabId) => {
    return get().tabs.find(tab => tab.id === tabId)
  }
}))
