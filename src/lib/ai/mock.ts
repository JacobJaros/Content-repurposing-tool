const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockTranscribe(): Promise<string> {
  await delay(1500);
  return `[00:00] Welcome back to the Content Mastery Podcast. I'm your host, and today we're diving deep into something that I think is one of the most overlooked strategies in digital marketing — content repurposing. If you're a creator, a marketer, or really anyone who produces content online, this episode is going to change the way you think about your workflow.

[00:25] So let me start with a stat that honestly blew my mind when I first heard it. The average content creator spends about 6 to 8 hours producing a single piece of long-form content — whether that's a podcast episode, a YouTube video, or a detailed blog post. But here's the thing — most of that content only gets published once, on one platform, and then it's basically forgotten. We're talking about wasting 70% or more of your content's potential.

[01:30] And I know what you're thinking — "I don't have time to be on every platform." And you're right, you don't have to be. But that's exactly where content repurposing comes in. It's not about creating more content from scratch. It's about taking what you've already created and transforming it into formats that work natively on different platforms.

[02:15] Let me give you a concrete example. Take this podcast episode we're recording right now. This is going to be about 30 minutes of audio. From this single recording, my team will create: a full blog post optimized for SEO, a Twitter thread that highlights the key takeaways, a LinkedIn article that positions the insights for a professional audience, an Instagram carousel that breaks down the framework visually, and probably 5 to 10 short video clips for TikTok and Instagram Reels.

[03:00] That's at least seven to ten pieces of content from one recording session. And the best part? Each piece is tailored for the platform it's going on. We're not just copy-pasting the transcript everywhere. We're adapting the message, the format, the tone — everything — to match what works on each platform.

[03:45] Now, let me walk you through the framework I use. I call it the Content Cascade Method, and it has three phases. Phase one is what I call the Master Content piece. This is your long-form, high-effort content — your podcast, your video, your in-depth article. This is where you go deep on a topic and really deliver value.

[04:30] Phase two is Analysis. This is where you pull out the key themes, quotes, arguments, and takeaways from your master content. Think of it like mining for gold — you're extracting the most valuable nuggets that can stand on their own.

[05:00] And phase three is Distribution. This is where you take those nuggets and format them for each platform. A powerful quote becomes a tweet. A three-step framework becomes a LinkedIn post. A surprising statistic becomes an Instagram slide. You see where I'm going with this?

[05:30] The key insight here — and this is something most people miss — is that each platform has its own language. Twitter rewards brevity and hot takes. LinkedIn rewards storytelling and professional insights. Instagram rewards visual structure and emotional hooks. If you try to use the same format everywhere, you'll get mediocre results everywhere.

[06:15] I had a client last year who was producing amazing YouTube videos — like genuinely great content — but they were only getting a few hundred views. When we implemented the Content Cascade Method, we didn't change their video strategy at all. We just started repurposing each video into platform-specific content. Within three months, their overall reach increased by 400%. Their YouTube views actually went up too, because the repurposed content was driving traffic back to the channel.

[07:00] So let me give you some practical tips to get started. Number one: start with one platform. Don't try to be everywhere at once. Pick the platform where your audience is most active and start repurposing for that first. Once you've got a system down, you can expand.

[07:30] Number two: use templates. Create templates for each platform format you're producing. This dramatically cuts down the time it takes to repurpose. For example, I have a Twitter thread template that has a hook, five value points, and a call to action. Every time I repurpose, I just fill in the blanks.

[08:00] Number three: batch your repurposing. Don't try to repurpose content on the same day you create it. Set aside one day a week — I do mine on Wednesdays — where you take all the master content from the previous week and repurpose it all at once. Batching is way more efficient.

[08:30] And number four — this is the big one — use AI tools to accelerate the process. There are amazing tools out there now that can help you analyze your content, extract key themes, and even generate first drafts of platform-specific content. You still need a human to refine and add personality, but AI can cut your repurposing time by 60 to 70%.

[09:00] The bottom line is this: content is king, but distribution is queen. And she wears the pants. You can create the best content in the world, but if you're only sharing it in one place, you're leaving massive value on the table. Repurposing isn't lazy — it's smart. It's strategic. And it's how the top creators are scaling their reach without burning out.

[09:30] That's all for today's episode. If you found this valuable, do me a favor and share it with another creator who needs to hear this. And if you want the full Content Cascade framework template, head over to our website — the link is in the show notes. Until next time, keep creating, keep repurposing, and keep growing. Peace.`;
}

export type AnalysisResult = {
  topics: string[];
  keyQuotes: string[];
  coreArguments: string[];
  narrativeArc: string;
  takeaways: string[];
};

export async function mockAnalyze(): Promise<AnalysisResult> {
  await delay(1000);
  return {
    topics: [
      "Content repurposing",
      "Social media strategy",
      "Audience growth",
      "Creator workflow optimization",
      "Platform-specific content",
    ],
    keyQuotes: [
      "Content is king, but distribution is queen. And she wears the pants.",
      "We're talking about wasting 70% or more of your content's potential.",
      "Each platform has its own language.",
      "Repurposing isn't lazy — it's smart. It's strategic.",
      "AI can cut your repurposing time by 60 to 70%.",
    ],
    coreArguments: [
      "Creators waste 70% of content potential by not repurposing across platforms",
      "Content must be adapted to each platform's native format, not just cross-posted",
      "The Content Cascade Method (Master → Analysis → Distribution) provides a systematic framework",
      "Starting with one platform and expanding is more sustainable than trying to be everywhere",
      "AI tools can dramatically accelerate the repurposing workflow",
    ],
    narrativeArc:
      "The transcript follows a problem-solution structure. It opens by identifying the problem (creators wasting content potential), quantifies the opportunity cost, then introduces the Content Cascade Method as a systematic solution. A client case study provides social proof, followed by four actionable tips for implementation. The piece closes with a memorable quote and clear call to action.",
    takeaways: [
      "Start with one platform and expand your repurposing strategy gradually",
      "Use templates for each platform to speed up the process",
      "Batch repurposing work into a dedicated day each week",
      "Leverage AI tools to cut repurposing time by 60-70%",
      "Adapt tone, format, and structure for each platform — don't just cross-post",
    ],
  };
}

export async function mockGenerate(
  platform: string
): Promise<string> {
  await delay(2000);

  // 20% random failure for error state testing
  if (Math.random() < 0.2) {
    throw new Error(`Mock generation failed for ${platform} (simulated error)`);
  }

  switch (platform) {
    case "TWITTER":
      return `🧵 Thread: Why 70% of your content potential is going to waste (and how to fix it)

1/ Most creators spend 6-8 hours on a single piece of content.

Then they publish it once. On one platform. And forget about it.

That's like writing a bestseller and only selling it in one bookstore.

2/ Here's the real cost: you're wasting 70%+ of your content's potential.

Not because the content is bad — because the distribution is broken.

One platform = one audience = one format = massive missed opportunity.

3/ The fix? Content repurposing. But NOT the way most people do it.

Copy-pasting your blog post as a LinkedIn update isn't repurposing.
It's being lazy. Each platform speaks a different language.

4/ Twitter rewards: brevity + hot takes
LinkedIn rewards: storytelling + professional insight
Instagram rewards: visual structure + emotional hooks
Blog rewards: depth + SEO

Same idea. Completely different execution.

5/ I use the Content Cascade Method:

📌 Phase 1: Create one Master Content piece (podcast, video, long post)
📌 Phase 2: Analyze — extract key themes, quotes, frameworks
📌 Phase 3: Distribute — adapt for each platform's native format

6/ Real example: One client went from a few hundred YouTube views to 4x overall reach in 3 months.

They didn't change their content strategy.
They just started repurposing systematically.

7/ 4 tips to start today:

→ Pick ONE platform to repurpose for first
→ Create templates for each format
→ Batch your repurposing (I do Wednesdays)
→ Use AI tools to generate first drafts (saves 60-70% time)

8/ "Content is king, but distribution is queen. And she wears the pants."

Stop creating more. Start distributing better.

♻️ Like this thread? Repost to help another creator.
💬 Drop a comment: which platform will you start repurposing for?`;

    case "LINKEDIN":
      return `I spent 8 hours creating a piece of content last week.

It got 47 views.

Not because it was bad. Because I published it in one place and moved on.

Sound familiar?

Here's what I've learned after helping 50+ creators scale their content:

The problem isn't creation — it's distribution.

Most creators are sitting on a goldmine of content that's only been seen by a fraction of their potential audience. We're talking about 70% of your content's value being left on the table.

But here's the uncomfortable truth: you can't just copy-paste across platforms.

Each platform speaks a different language:
→ Twitter wants brevity and hot takes
→ LinkedIn wants storytelling and professional insight
→ Instagram wants visual structure and emotional hooks
→ Blogs want depth and SEO optimization

Same message. Completely different packaging.

That's why I developed the Content Cascade Method:

1️⃣ Master Content — Create one deep, high-value piece
2️⃣ Analysis — Extract key themes, quotes, and frameworks
3️⃣ Distribution — Adapt each nugget for platform-native formats

One client implemented this and saw their overall reach increase 400% in 90 days. Their original platform (YouTube) actually grew too — because repurposed content drove traffic back.

The four things that made the biggest difference:
• Starting with just ONE secondary platform
• Using templates for each format (cuts production time in half)
• Batching repurposing work into one dedicated day
• Using AI to generate first drafts (saves 60-70% of the work)

Content is king, but distribution is queen.

And she wears the pants.

What platform are you going to start repurposing for? 👇`;

    case "INSTAGRAM":
      return `SLIDE 1:
🚨 You're wasting 70% of your content
Here's how to fix it →

SLIDE 2:
THE PROBLEM
You spend 6-8 hours creating content...
Then publish it ONCE on ONE platform
And never touch it again.

SLIDE 3:
THE MATH
1 podcast episode can become:
✏️ 1 blog post
🐦 1 Twitter thread
💼 1 LinkedIn article
📸 1 Instagram carousel
🎬 5-10 short video clips
= 10+ pieces from 1 recording

SLIDE 4:
BUT HERE'S THE CATCH
You can't just copy-paste!
Each platform has its own language:
• Twitter → Brevity + hot takes
• LinkedIn → Stories + pro insights
• Instagram → Visuals + emotion
• Blog → Depth + SEO

SLIDE 5:
THE CONTENT CASCADE METHOD
Phase 1: CREATE
→ One deep, master content piece

SLIDE 6:
Phase 2: ANALYZE
→ Extract key themes
→ Pull out quotable moments
→ Identify frameworks & tips

SLIDE 7:
Phase 3: DISTRIBUTE
→ Adapt each nugget for the right platform
→ Match the tone, format, and style
→ One idea, many expressions

SLIDE 8:
REAL RESULTS
One creator went from a few hundred views to 4x total reach in just 3 months using this method.

They didn't create more content.
They distributed it better.

SLIDE 9:
START HERE 👇
1. Pick ONE platform to repurpose for
2. Create templates for each format
3. Batch your repurposing (1 day/week)
4. Use AI to draft — you refine

Save this post & tag a creator who needs this ♻️`;

    case "BLOG":
      return `---
title: "The Content Cascade Method: How to 4x Your Reach Without Creating More Content"
meta_description: "Learn how top creators repurpose a single piece of content into 10+ platform-optimized outputs using the Content Cascade Method. Step-by-step framework inside."
---

# The Content Cascade Method: How to 4x Your Reach Without Creating More Content

If you're spending hours creating content only to publish it once and move on, you're leaving 70% of its value on the table. Here's a systematic framework to change that.

## The Hidden Cost of Single-Platform Publishing

The average content creator spends 6 to 8 hours producing a single piece of long-form content. A podcast episode, a YouTube video, an in-depth blog post — these are significant investments of time and creative energy.

Yet most of that content gets published once, on one platform, and is effectively forgotten within 48 hours. The reach is limited to a single audience, in a single format, on a single channel.

This isn't a content quality problem. It's a distribution problem.

## Why Copy-Pasting Doesn't Work

Before we go further, let's address the elephant in the room: content repurposing is not the same as cross-posting.

Copying your blog post and pasting it as a LinkedIn update isn't repurposing — it's being lazy, and your audience can tell. Each platform has its own native language:

- **Twitter/X**: Rewards brevity, strong opinions, and conversational hot takes
- **LinkedIn**: Rewards professional storytelling, data-driven insights, and thought leadership
- **Instagram**: Rewards visual structure, emotional hooks, and scannable formats
- **Blogs**: Reward depth, comprehensive coverage, and SEO optimization

The same core idea needs to be expressed differently for each platform to perform well.

## The Content Cascade Method

The Content Cascade Method is a three-phase framework for systematically repurposing content:

### Phase 1: Master Content

Create one high-effort, long-form piece of content. This is your "master" asset — a podcast episode, a video, or a detailed article where you go deep on a topic and deliver substantial value.

This is the only piece you create from scratch. Everything else flows from it.

### Phase 2: Analysis

Extract the most valuable elements from your master content:

- **Key themes** and topics covered
- **Quotable moments** that can stand alone
- **Core arguments** and supporting data
- **Frameworks or step-by-step processes**
- **Surprising statistics or counterintuitive insights**

Think of this as mining for gold — you're identifying the nuggets that can shine on their own.

### Phase 3: Distribution

Take each extracted element and format it for a specific platform:

- A powerful quote becomes a tweet
- A three-step framework becomes a LinkedIn post
- A surprising statistic becomes an Instagram carousel slide
- A detailed process becomes a blog section with SEO keywords

Each piece is adapted in tone, format, length, and structure to match what performs well on that platform.

## Real Results: A Case Study

One creator was producing high-quality YouTube videos but only getting a few hundred views per video. After implementing the Content Cascade Method — without changing their video strategy at all — their results transformed:

- **Overall reach increased by 400%** within three months
- **YouTube views actually increased** as repurposed content drove traffic back to the channel
- **Email list grew by 150%** from cross-platform discovery
- **Content production time decreased** because they stopped trying to create original content for every platform

## How to Get Started: 4 Practical Steps

### 1. Start With One Platform

Don't try to repurpose for every platform at once. Choose the one where your target audience is most active and build your repurposing muscle there first. Once you have a reliable system, expand to additional platforms.

### 2. Create Templates

Develop templates for each content format you produce. For example, a Twitter thread template might include: a hook, five value points, and a call to action. Templates dramatically reduce the time and cognitive effort required for each piece.

### 3. Batch Your Repurposing

Don't repurpose on the same day you create. Set aside one dedicated day per week for repurposing all the master content from the previous week. Batching similar tasks is significantly more efficient than context-switching throughout the week.

### 4. Leverage AI Tools

Modern AI tools can analyze your content, extract key themes, and generate first drafts of platform-specific outputs. You'll still need to refine and add your personal voice, but AI can reduce your repurposing time by 60-70%.

## The Bottom Line

Content is king, but distribution is queen. You can create the best content in the world, but if you're only sharing it in one place, you're missing the majority of its potential impact.

Repurposing isn't lazy — it's strategic. It's how the most successful creators scale their reach without burning out. Start with the Content Cascade Method, and you'll be amazed at how much more value you can extract from the content you're already creating.`;

    default:
      return `Generated content for ${platform}.\n\nThis is placeholder content for the ${platform} platform based on the analyzed source material about content repurposing strategies.`;
  }
}
