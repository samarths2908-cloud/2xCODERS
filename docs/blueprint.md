# **App Name**: WattWise EV

## Core Features:

- User Authentication & Profile: Secure user registration, login, and profile management using Firebase Authentication, supporting both EV drivers and administrators.
- Interactive EV Station Map: Displays user's current location, nearby charging stations with live status, and enables drawing routes with estimated travel times using Google Maps integration. Supports a demo mode with simulated stations.
- Smart Station Recommendation Tool: A tool that analyzes travel time, real-time queue/wait times, and estimated charging durations based on user's current battery and target charge to recommend the fastest overall station. Supports dynamic recalculation in demo and real modes.
- Real-time Station Availability & Booking: Displays live status badges for individual charging ports (Free, Busy, Charging, Delayed) and allows users to book an available port directly, providing an estimated total time including travel, wait, and charge. Data from Firestore is used for real-time updates.
- Dynamic Rerouting Tool ('Instant Switch'): A tool that proactively suggests alternative, faster charging stations if a booked or targeted station experiences unexpected delays or increased congestion, ensuring optimal travel efficiency. Triggers reroute notifications.
- Congestion Heatmap & Busy-Hour Indicator: Visualizes station busyness through a simple congestion heatmap overlay on the map and displays busy-hour predictions for charging stations, helping users anticipate wait times.
- Simplified Administrator Dashboard: An MVP admin panel allowing operators to monitor the real-time load, port statuses, and queue entries for their stations.

## Style Guidelines:

- Primary color: Modern electric blue (#387EE6) to convey trust, technology, and efficiency, creating a clean and forward-thinking aesthetic.
- Background color: Very light blue-grey (#EEF1F4), derived from the primary hue but heavily desaturated, offering a subtle, calm, and readable backdrop for all content in a light theme.
- Accent color: Vibrant aqua (#33DBED), analogous to the primary color, providing a dynamic highlight for interactive elements and call-to-actions, ensuring strong visual contrast and user guidance.
- Headlines font: 'Space Grotesk' (sans-serif) for a contemporary, techy, and slightly condensed feel that aligns with a smart EV solution.
- Body font: 'Inter' (sans-serif) for exceptional legibility and a neutral, objective aesthetic, ensuring clear data presentation and user instructions.
- Utilize a cohesive set of clear, outline-style vector icons for station types, charging port statuses, and navigation. Implement distinct map markers for different station states and a heatmap overlay for congestion.
- Employ a mobile-first, responsive grid layout with a prominent interactive map. Use card-based UI elements for displaying station details, booking panels, and dashboard widgets, ensuring intuitive information hierarchy.
- Incorporate subtle, performant animations for map interactions (zooming, panning, route drawing), real-time status updates on cards, and smooth transitions for modal windows and rerouting suggestions to enhance user experience.