"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content?: React.ReactNode;
}

export function PlaceholderPage({ title, description, icon: Icon, content }: PlaceholderPageProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-text-900 dark:text-text-100 mb-2 flex items-center gap-3">
          <Icon className="w-8 h-8 text-primary-600" />
          {title}
        </h1>
        <p className="text-text-600 dark:text-text-400">
          {description}
        </p>
      </motion.div>

      {content || (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-background/60 backdrop-blur-lg shadow-xl border border-border/20">
            <CardContent className="p-12">
              <div className="text-center">
                <Icon className="w-24 h-24 text-text-400 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-text-700 dark:text-text-300 mb-4">
                  {title} Content
                </h2>
                <p className="text-text-500 max-w-md mx-auto">
                  This page is ready for implementation. Advanced {title.toLowerCase()} features and visualizations will be added here.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
