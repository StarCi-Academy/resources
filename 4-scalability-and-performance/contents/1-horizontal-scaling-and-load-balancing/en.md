# title: Horizontal Scaling & Load Balancing: Distributing the Load
# description: Understand how to duplicate services into multiple replicas (horizontal scaling) and use a Load Balancer to distribute requests evenly, preventing localized system overload.
# body:

## I. Lời mở đầu (The Hook)

You’ve decided to deploy more servers to solve the load bottleneck from the previous lesson. Now you have 5 application servers running smoothly. But how does your user's smartphone know which server to call? Randomly? Alternating? And what if server number 3 suddenly dies mid-request?

One of the most fatal architectural mistakes is pointing a domain directly to a hardcoded instance IP. A fleet of servers doesn't just need to **exist**—they need a **coordinator** standing at the gate, smartly knowing which machine is idle and which is dead, to seamlessly route traffic. Today, we dive deep into the ultimate architectural duo: **Horizontal Scaling** (replicating nodes) and the **Load Balancer** (the traffic director).

## II. Demo tư duy: From One Machine to a Fleet

### 1. Scale Out: Pumping Up Replicas
Imagine an e-commerce shopping cart system. Initially, it runs solely on `Cart-Service-A`. When the CPU catches fire under pressure, we spin up `Cart-Service-B` and `Cart-Service-C`. This fleet expansion is called **Horizontal Scaling** (scaling out to 3 replicas).
But here's the catch: if the mobile app keeps rigidly calling the IP of instance A, servers B and C will sit idle drinking coffee!

### 2. Enter the Load Balancer
This is where we erect a massive **Load Balancer** in front of those 3 nodes:
- All external requests hit exactly one unified endpoint: the **Load Balancer**.
- The LB checks its configuration and splits the river: the first request goes to node A, the second to B, the third to C, following a fair algorithm.

Expected Outcome: Customers always experience blazing fast responses, totally unaware that behind the curtain, ten different instances are sweating and taking turns serving them. The **stateless** fault-tolerant architecture is now operational.

## III. Giải thích nâng cao & Kết luận

### 1. Why Must the App be Stateless?
**Horizontal Scaling** only works magic if your application strictly follows the **stateless** rule. If your login API stores the user session in the physical RAM of node A, the next time the load balancer routes their checkout request to node B -> the app will slap them with a `401 Unauthorized`.
- **The Fix:** Decouple all state from the app server's memory. Push authentication into self-contained JWT tokens or dump the session data into an external, shared caching layer (like **Redis**).

### 2. Load Balancing Algorithms
A **Load Balancer** doesn't just toss requests blindly. It strictly adheres to mathematical routing:
- **Round Robin:** Passes traffic sequentially evenly (A -> B -> C -> back to A). Simple, highly fair, and safe.
- **Least Connections:** Throws the next task to whichever node is currently handling the fewest active connections. Extremely effective for architectures where some requests hold onto the CPU longer than others.

### 3. Layer 4 vs Layer 7 Load Balancing
- **Layer 4 (Transport):** Operates blazingly fast at the TCP/UDP level. It merely looks at IPs and Ports without dissecting the HTTP payload. Perfect for high-speed edge routing.
- **Layer 7 (Application):** Deeply understands the HTTP request. It reads URL paths, knowing if you called `/api/images` so it can route you to a static asset cluster, or `/api/payment` to route you to the highly-secured financial vault.

While the Application layer can scale horizontally to thousands of instances behind a **Load Balancer**, this inverted pyramid violently funnels millions of queries down into a single, exhausted centralized Database. The bottleneck has simply shifted down to the DB level. The immediate firefighting measure for this? Let's meet the primary candidate in the next lesson: **Caching**.
