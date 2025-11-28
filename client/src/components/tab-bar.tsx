"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MoreHorizontal } from 'lucide-react'
import { useTabStore, Tab } from '@/stores/tabStore'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TabBarProps {
  className?: string
}

function SortableTabItem({ tab, isActive }: { tab: Tab; isActive: boolean }) {
  const { setActiveTab, removeTab } = useTabStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTabClick = () => {
    setActiveTab(tab.id)
  }

  const handleCloseTab = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeTab(tab.id)
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, x: -10, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.95 }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] cursor-pointer",
        "border-r border-white transition-all duration-200 select-none",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "bg-background/60 text-muted-foreground hover:bg-background/80 hover:text-foreground"
      )}
      onClick={handleTabClick}
    >
      <tab.icon className="h-4 w-4 shrink-0" />
      <span className="truncate text-sm font-medium">{tab.title}</span>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-5 w-5 p-0 shrink-0 rounded-sm opacity-0 group-hover:opacity-100",
          "hover:bg-muted-foreground/20 transition-opacity duration-200"
        )}
        onClick={handleCloseTab}
      >
        <X className="h-3 w-3" />
      </Button>
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      )}
    </motion.div>
  )
}

export function TabBar({ className }: TabBarProps) {
  const { tabs, activeTabId, closeAllTabs, closeOtherTabs, reorderTabs } = useTabStore()
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab) => tab.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTabs = arrayMove(tabs, oldIndex, newIndex);
        reorderTabs(newTabs);
      }
    }
  }

  if (tabs.length === 0) {
    return null
  }

  return (
    <div className={cn(
      "flex items-center border-b border-white bg-background/80 backdrop-blur-sm h-10",
      className
    )}>
      {/* Tab List */}
      <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tabs.map(tab => tab.id)}
            strategy={horizontalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              {tabs.map((tab) => (
                <SortableTabItem
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTabId}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      </div>
      
      {/* Tab actions menu */}
      <div className="flex-shrink-0 px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 hover:bg-background/60"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={closeAllTabs}>
              Close All Tabs
            </DropdownMenuItem>
            {activeTabId && (
              <DropdownMenuItem onClick={() => closeOtherTabs(activeTabId)}>
                Close Other Tabs
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              {tabs.length} tab{tabs.length !== 1 ? 's' : ''} open
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
