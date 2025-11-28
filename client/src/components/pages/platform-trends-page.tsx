"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Search, ImageOff } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface NewsArticle {
  uri: string;
  title: string;
  url: string;
  image?: string;
  source?: {
    title: string;
  };
  dateTimePub?: string;
}

/* -------------------------------------------------------------------------- */
/*                               NEWS CONFIG                                  */
/* -------------------------------------------------------------------------- */

const NEWS_API_URL = "https://eventregistry.org/api/v1/article/getArticles";
const NEWS_API_KEY = "260cf323-495a-49b3-a805-24747e91907b";

/**
 * ✅ EventRegistry-compliant fetch
 */
async function fetchNews(keyword: string): Promise<NewsArticle[]> {
  const body = {
    action: "getArticles",
    keyword,
    lang: "eng",
    articlesPage: 1,
    articlesCount: 10,
    articlesSortBy: "date",
    articlesSortByAsc: false,
    forceMaxDataTimeWindow: 31,
    resultType: "articles",
    apiKey: NEWS_API_KEY
  };

  try {
    const res = await fetch(NEWS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Non JSON response:", text);
      return [];
    }

    return data?.articles?.results ?? [];
  } catch (err) {
    console.error("News fetch failed:", err);
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*                           SEARCHABLE NEWS WIDGET                            */
/* -------------------------------------------------------------------------- */

const NewsSearchWidget = () => {
  const [query, setQuery] = useState("election");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNews = async () => {
    setLoading(true);
    const results = await fetchNews(query);
    setNews(results);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WidgetCard>
      <Card className="border-0 bg-transparent">
        <CardHeader className="space-y-4">
          <CardTitle className="flex items-center gap-2">
            📰 Election News
          </CardTitle>

          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              placeholder="Search news (e.g. polling, EVM, voting)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadNews()}
            />
            <Button onClick={loadNews} variant="secondary">
              <Search size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center">
              Loading news…
            </p>
          ) : news.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No articles found.
            </p>
          ) : (
            <ul className="space-y-4">
              {news.map((article) => (
                <li
                  key={article.uri}
                  className="flex gap-4 bg-background/40 rounded-xl p-3 hover:shadow transition"
                >
                  {/* Image */}
                  {article.image ? (
                    <img
                      src={article.image}
                      alt="news"
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-20 flex items-center justify-center bg-muted rounded-lg">
                      <ImageOff className="text-muted-foreground" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                    >
                      {article.title}
                    </a>

                    <div className="text-xs text-muted-foreground mt-1">
                      {article.source?.title || "Unknown source"}
                      {article.dateTimePub &&
                        ` · ${new Date(
                          article.dateTimePub
                        ).toLocaleString()}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </WidgetCard>
  );
};

/* -------------------------------------------------------------------------- */
/*                              UI WRAPPER CARD                                */
/* -------------------------------------------------------------------------- */

const WidgetCard = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-background/60 rounded-xl border shadow"
  >
    {children}
  </motion.div>
);

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function PlatformTrendsPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Trends</h1>
          <p className="text-muted-foreground">
            Track election-related news & misinformation signals
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <Clock size={16} />
          Real-time
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NewsSearchWidget />

            <WidgetCard>
              <Card className="border-0 bg-transparent">
                <CardHeader>
                  <CardTitle>Why this matters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    Real-time monitoring of news enables early detection of
                    misinformation narratives.
                  </p>
                  <Badge variant="secondary">
                    AI-assisted + Human oversight
                  </Badge>
                </CardContent>
              </Card>
            </WidgetCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
