import React, { createContext, useContext, useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, Folder, FolderOpen, File } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'

export interface TreeItemData {
  id: string | number
  name: string
  parent_id?: string | number | null
  children?: TreeItemData[]
  [key: string]: any
}

interface TreeViewProps<T> {
  data: T[]
  className?: string
  renderItem: (item: T, level: number, isExpanded: boolean, hasChildren: boolean) => React.ReactNode
  keyField?: keyof T
  parentField?: keyof T
  defaultExpanded?: boolean
}

const TreeContext = createContext<{
  expanded: Set<string | number>
  toggle: (id: string | number) => void
}>({ expanded: new Set(), toggle: () => {} })

export function TreeView<T extends TreeItemData>({
  data,
  className,
  renderItem,
  keyField = 'id' as keyof T,
  parentField = 'parent_id' as keyof T,
  defaultExpanded = false
}: TreeViewProps<T>) {
  // Build Tree Structure
  const treeData = useMemo(() => {
    const map = new Map<string | number, T & { children: T[] }>()
    const roots: (T & { children: T[] })[] = []

    // 1. Initialize map
    data.forEach((item) => {
      // @ts-ignore
      const id = item[keyField]
      // @ts-ignore
      map.set(id, { ...item, children: [] })
    })

    // 2. Build Hierarchy
    data.forEach((item) => {
      // @ts-ignore
      const id = item[keyField]
      // @ts-ignore
      const parentId = item[parentField]

      const node = map.get(id)

      if (parentId !== null && parentId !== undefined && map.has(parentId)) {
        const parent = map.get(parentId)
        parent!.children.push(node!)
      } else {
        if (node) roots.push(node)
      }
    })

    return roots
  }, [data, keyField, parentField])

  const [expanded, setExpanded] = useState<Set<string | number>>(new Set())

  // Optional: Auto expand all if needed
  React.useEffect(() => {
    if (defaultExpanded) {
      // @ts-ignore
      const allIds = data.map((i) => i[keyField])
      setExpanded(new Set(allIds))
    }
  }, [defaultExpanded, data, keyField])

  const toggle = (id: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <TreeContext.Provider value={{ expanded, toggle }}>
      <div className={cn('select-none p-2', className)} dir="rtl">
        {treeData.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed rounded-xl text-muted-foreground text-sm bg-muted/20">
            لا توجد عناصر لعرضها
          </div>
        ) : (
          <ul className="space-y-2">
            {treeData.map((node) => (
              <TreeNode
                // @ts-ignore
                key={node[keyField]}
                node={node}
                level={0}
                renderItem={renderItem}
                keyField={keyField}
              />
            ))}
          </ul>
        )}
      </div>
    </TreeContext.Provider>
  )
}

function TreeNode<T extends TreeItemData>({
  node,
  level,
  renderItem,
  keyField
}: {
  node: T & { children: T[] }
  level: number
  renderItem: any
  keyField: any
}) {
  const { expanded, toggle } = useContext(TreeContext)
  // @ts-ignore
  const id = node[keyField]
  const isExpanded = expanded.has(id)
  const hasChildren = node.children && node.children.length > 0

  return (
    <li className="relative">
      <div
        className={cn(
          'group flex items-center gap-2 py-1 px-2 rounded-lg transition-all duration-200 border border-transparent hover:bg-accent/50 hover:border-accent',
          isExpanded && hasChildren && 'bg-accent/20'
        )}
        onClick={(e) => {
          e.stopPropagation()
          if (hasChildren) toggle(id)
        }}
      >
        <button
          className={cn(
            'h-6 w-6 shrink-0 flex items-center justify-center rounded-md text-muted-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors',
            !hasChildren && 'opacity-0 pointer-events-none'
          )}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div
          className={cn(
            'shrink-0 transition-colors',
            hasChildren ? 'text-blue-500/80' : 'text-slate-400'
          )}
        >
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="h-5 w-5" />
            ) : (
              <Folder className="h-5 w-5" />
            )
          ) : (
            <File className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">{renderItem(node, level, isExpanded, hasChildren)}</div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="mr-5 pr-2 border-r-2 border-border/40 space-y-1 mt-1 relative">
              {node.children.map((child) => (
                <TreeNode
                  // @ts-ignore
                  key={child[keyField]}
                  // Fix Type Error: Ensure child has children array structure for recursion
                  node={{ ...child, children: (child as any).children || [] }}
                  level={level + 1}
                  renderItem={renderItem}
                  keyField={keyField}
                />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
