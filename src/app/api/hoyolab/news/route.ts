import { NextResponse } from "next/server";

// HoYoLAB API endpoints
const HOYOLAB_NEWS_API =
  "https://bbs-api-os.hoyolab.com/community/post/wapi/getNewsList";
const GAME_ID = 6; // Honkai: Star Rail

interface HoyolabNewsItem {
  post: {
    post_id: string;
    subject: string;
    content: string;
    created_at: number;
    classification_id: string;
  };
  image_list: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  stat: {
    view_num: number;
    like_num: number;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "1"; // 1=notices, 2=events, 3=info
  const pageSize = searchParams.get("pageSize") || "5";

  try {
    const response = await fetch(
      `${HOYOLAB_NEWS_API}?gids=${GAME_ID}&page_size=${pageSize}&type=${type}`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`HoYoLAB API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.retcode !== 0) {
      throw new Error(`HoYoLAB API returned error: ${data.message}`);
    }

    // Transform the data
    const news = data.data.list.map((item: HoyolabNewsItem) => ({
      id: item.post.post_id,
      title: item.post.subject,
      description: item.post.content.slice(0, 200),
      createdAt: new Date(item.post.created_at * 1000).toISOString(),
      image: item.image_list[0]?.url || null,
      views: item.stat.view_num,
      likes: item.stat.like_num,
      type: getCategoryName(item.post.classification_id),
      url: `https://www.hoyolab.com/article/${item.post.post_id}`,
    }));

    return NextResponse.json({
      success: true,
      data: news,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching HoYoLAB news:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch news",
      },
      { status: 500 }
    );
  }
}

function getCategoryName(classificationId: string): string {
  const categories: Record<string, string> = {
    "22": "notice",
    "25": "announcement",
    "26": "event",
    "27": "info",
  };
  return categories[classificationId] || "news";
}
