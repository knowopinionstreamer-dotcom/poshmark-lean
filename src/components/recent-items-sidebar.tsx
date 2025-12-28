'use client';

import { useEffect, useState } from 'react';
import { getRecentItems } from '@/app/inventory-actions';
import Link from 'next/link';
import { Package, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

export default function RecentItemsSidebar() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const recent = await getRecentItems(5);
      setItems(recent);
    } catch (error) {
      console.error('Failed to fetch recent items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // Refresh items every 30 seconds or on some event
    const interval = setInterval(fetchItems, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-muted-foreground flex items-center">
        <Clock className="mr-2 h-4 w-4" />
        Recent Catalog
      </h2>
      <div className="space-y-1">
        {isLoading && items.length === 0 ? (
          <p className="px-4 text-xs text-muted-foreground animate-pulse">Loading items...</p>
        ) : items.length === 0 ? (
          <p className="px-4 text-xs text-muted-foreground italic">No items processed yet.</p>
        ) : (
          <ScrollArea className="h-[200px] pr-4">
            {items.map((item) => (
              <Link key={item.id} href={`/new-listing?id=${item.id}&tab=details`}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-auto py-2 flex items-start gap-2">
                  <div className="h-8 w-8 rounded bg-muted flex-shrink-0 overflow-hidden border">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-full w-full p-1 opacity-50" />
                    )}
                  </div>
                  <div className="flex-1 truncate text-left">
                    <p className="font-medium truncate">{item.title || `${item.brand} ${item.model}` || 'Untitled Item'}</p>
                    <p className="text-[10px] opacity-70 uppercase">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </Button>
              </Link>
            ))}
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
