import { NextResponse } from "next/server";

// HoYoLAB API for getting banner images from news
const HOYOLAB_NEWS_API =
  "https://bbs-api-os.hoyolab.com/community/post/wapi/getNewsList";
const GAME_ID = 6; // Honkai: Star Rail

interface HoyolabNewsItem {
  post: {
    post_id: string;
    subject: string;
    content: string;
    created_at: number;
  };
  image_list: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

export async function GET() {
  try {
    // Fetch announcements (type=1) to find Event Warp news
    const response = await fetch(
      `${HOYOLAB_NEWS_API}?gids=${GAME_ID}&page_size=20&type=1`,
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

    // Find Event Warp news to get banner images
    const bannerNews = data.data.list
      .filter((item: HoyolabNewsItem) =>
        item.post.subject.toLowerCase().includes("event warp")
      )
      .map((item: HoyolabNewsItem) => ({
        id: item.post.post_id,
        title: item.post.subject,
        image: item.image_list[0]?.url || null,
        createdAt: new Date(item.post.created_at * 1000).toISOString(),
      }));

    return NextResponse.json({
      success: true,
      data: bannerNews,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching banner images:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch banners",
      },
      { status: 500 }
    );
  }
}
