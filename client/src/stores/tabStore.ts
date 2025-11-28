import { create } from 'zustand'

export interface Tab {
  id: string
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType
  isDirty?: boolean
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  getActiveTab: () => Tab | null
  addTab: (tab: Tab) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  closeAllTabs: () => void
  closeOtherTabs: (tabId: string) => void
  updateTab: (tabId: string, updates: Partial<Tab>) => void
  reorderTabs: (newTabs: Tab[]) => void
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  getActiveTab: () => {
    const {tabs, activeTabId} = get();
    return tabs.find(t => t.id === activeTabId) || null;
  },
  addTab: (tab) => set((state) => {
    // Check if tab already exists
    const existingTab = state.tabs.find(t => t.id === tab.id)
    if (existingTab) {
      return { activeTabId: tab.id }
    }
    
    return {
      tabs: [...state.tabs, tab],
      activeTabId: tab.id
    }
  }),
  
  removeTab: (tabId) => set((state) => {
    const newTabs = state.tabs.filter(t => t.id !== tabId)
    let newActiveTabId = state.activeTabId
    
    // If we're closing the active tab, switch to another tab
    if (state.activeTabId === tabId) {
      if (newTabs.length > 0) {
        const currentIndex = state.tabs.findIndex(t => t.id === tabId)
        // Try to activate the tab to the right, or the last tab
        newActiveTabId = newTabs[Math.min(currentIndex, newTabs.length - 1)]?.id || null
      } else {
        newActiveTabId = null
      }
    }
    
    return {
      tabs: newTabs,
      activeTabId: newActiveTabId
    }
  }),
  
  setActiveTab: (tabId) => set({ activeTabId: tabId }),
  
  closeAllTabs: () => set({ tabs: [], activeTabId: null }),
  
  closeOtherTabs: (tabId) => set((state) => ({
    tabs: state.tabs.filter(t => t.id === tabId),
    activeTabId: tabId
  })),
  
  updateTab: (tabId, updates) => set((state) => ({
    tabs: state.tabs.map(tab => 
      tab.id === tabId ? { ...tab, ...updates } : tab
    )
  })),
  
  reorderTabs: (newTabs) => set({ tabs: newTabs })
}))
