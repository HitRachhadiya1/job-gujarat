import React, { createContext, useContext } from "react";

const TabsContext = createContext({ value: undefined, onValueChange: () => {} });

export function Tabs({ value, onValueChange, children, className = "" }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }) {
  return (
    <div className={`inline-grid gap-2 p-1 rounded-lg bg-stone-100 dark:bg-stone-900 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "" }) {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange && ctx.onValueChange(value)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
        ${active ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow" : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"}
        ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}

export default {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
};
