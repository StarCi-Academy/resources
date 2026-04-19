# title: What is Scalability? Bottlenecks During Traffic Spikes
# description: The core concept of scalability. Why systems usually break at the database rather than the application layer when user traffic suddenly spikes.
# body:

## I. Lời mở đầu (The Hook)

One fine day, your company's marketing campaign is a massive hit, multiplying your active users by 10x. And boom — the system **crashes**. You are awakened at 2 AM, desperately applying a temporary patch by restarting the services, but it crashes again shortly after.

In interviews, the question "What would you do if your traffic spikes 10x?" often leaves candidates stumbling. Most rush to answer, "I'll add more **RAM**" or "I'll spin up more **instances**." But what if after adding all those machines, the system is still stuck at the **database** layer? This lesson will provide you with the overarching picture: when requests spike, where exactly does the system **break** and how to diagnose the real issue.

## II. Demo tư duy: Tracing the Request Flow

Since this is a foundational lesson, we don't need code. Let's conceptually map out a typical **request** flow to intuitively pinpoint the bottlenecks.

### 1. Normal Scenario
When a user buys an item, the request goes from their phone to the **API Server**, which then queries **PostgreSQL** to check inventory. If there are 100 buyers per minute, a single application server processes tasks smoothly, responding well under **50ms**.

### 2. Traffic Spike Scenario
Now imagine 10,000 buyers log in simultaneously during a Flash Sale:
- **API Server** starts bottlenecking on computation. CPU maxes out at 100%. Requests pile up, waiting for their API calls to resolve.
- The sudden flood of API queries overloads **PostgreSQL**. Connection limits are exceeded, throwing database timeout errors.
- Response times degrade from **50ms** to **5000ms**, and the user screen simply freezes.

Expected Outcome: The entire system collapses. The problem isn't just missing server RAM; it's that wherever the resource is **stateful** (like a database holding essential state), the bottleneck will naturally migrate there. This is when we must tackle scalability head-on.

## III. Giải thích nâng cao & Kết luận

### 1. The Core Meaning of Scalability
**Scalability** is not just about throwing money at more servers. It is the ability of a system to maintain or improve performance (such as throughput) proportionately as resources are added. If you double the hardware of a poorly designed system and your capacity only increases by 20% — that is considered **not scalable**.

- **Example 1:** Services that are **stateless** (holding no session context internally) are typically infinitely scalable. You just spin up another instance to handle the overflow.
- **Example 2:** A **Database** is inherently stateful. You could stack ten layers of API servers, but if the database is struggling with write locks, the system remains choked at the narrowest point.

### 2. Vertical vs Horizontal Scaling
When pressured by explosive loads, you face two primary choices:
- **Scale Up (Vertical Scaling):** Upgrading the current machine itself. Add more **RAM**, switch to a beefier CPU. It's fast to implement and requires zero code changes. The fatal flaw is that it remains a **Single Point of Failure** (if it dies, you're offline) and hardware limits are absolute.
- **Scale Out (Horizontal Scaling):** Purchasing thousands of cheaper nodes to distribute the workload. This is the superpower of distributed systems. The trade-off is the immense operational complexity of orchestrating traffic and maintaining data consistency across nodes.

To wrap up, handling distributed loads isn't about building an indestructible monolith, but engineering a resilient "ant colony"—working together logically. Let's see how they divide that work in the next topic: **Load Balancing**.
