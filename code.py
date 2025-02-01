import math
from itertools import permutations
from functools import lru_cache

# Function to calculate the Euclidean distance between two points
def calculate_distance(point1, point2):
    return math.sqrt((point2[0] - point1[0])**2 + (point2[1] - point1[1])**2)

# Function to solve TSP using Dynamic Programming with memoization
def tsp_dp(points):
    n = len(points)
    if n == 1:
        return 0, points  # No distance to travel with only one point

    all_visited = (1 << n) - 1

    @lru_cache(None)
    def dp(visited, current):
        if visited == all_visited:  # All points visited
            return calculate_distance(points[current], points[0]), [0]
        min_cost = float('inf')
        min_path = []
        for next_point in range(n):
            if not (visited & (1 << next_point)):  # If not visited
                cost, path = dp(visited | (1 << next_point), next_point)
                cost += calculate_distance(points[current], points[next_point])
                if cost < min_cost:
                    min_cost = cost
                    min_path = [next_point] + path
        return min_cost, min_path

    min_distance, path = dp(1, 0)  # Start at the first point
    optimized_path = [points[i] for i in [0] + path]
    return min_distance, optimized_path

# Main function to handle user input and solve the route optimization
def find_optimized_route():
    # Step 1: Get user input for locations and priorities
    num_locations = int(input("Enter the number of locations: "))
    locations = []
    priorities = []
    print("Enter each location as 'x y priority' (e.g., 2 3 high):")
    for _ in range(num_locations):
        x, y, priority = input().split()
        locations.append((int(x), int(y)))
        priorities.append(priority)

    # Step 2: Organize locations by priority
    priority_levels = {'high': [], 'medium': [], 'low': []}
    for loc, prio in zip(locations, priorities):
        priority_levels[prio].append(loc)

    # Step 3: Calculate the optimized route
    current_location = locations[0]  # Start at the first location
    total_distance = 0
    optimized_route = [current_location]

    # Solve for high-priority locations
    if priority_levels['high']:
        high_distance, high_route = tsp_dp([current_location] + priority_levels['high'])
        optimized_route += high_route[1:]  # Skip the duplicate start point
        total_distance += high_distance
        current_location = high_route[-1]

    # Solve for medium-priority locations
    if priority_levels['medium']:
        medium_distance, medium_route = tsp_dp([current_location] + priority_levels['medium'])
        optimized_route += medium_route[1:]
        total_distance += medium_distance
        current_location = medium_route[-1]

    # Solve for low-priority locations
    if priority_levels['low']:
        low_distance, low_route = tsp_dp([current_location] + priority_levels['low'])
        optimized_route += low_route[1:]
        total_distance += low_distance

    # Step 4: Output the optimized route and total distance
    print("\nOptimized Route:", optimized_route)
    print("Total Distance:", round(total_distance, 2))

# Run the program
if __name__ == "__main__":
    find_optimized_route()
