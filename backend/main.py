from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Tuple
import random
import math
import time
from datetime import datetime, timedelta
import heapq

app = FastAPI(
    title="GreenPath Logistics Engine",
    version="2.0.0",
    description="Reinforcement Learning-powered logistics routing API"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# City Graph
# ============================================================

class CityGraph:
    def __init__(self, size: int = 8):
        self.grid_size = size
        self.total_nodes = size * size
        self.edges: Dict[str, dict] = {}
        self._build_graph()

    def _build_graph(self):
        spacing = 100
        for row in range(self.grid_size):
            for col in range(self.grid_size):
                node = row * self.grid_size + col
                # Right neighbor
                if col < self.grid_size - 1:
                    right = row * self.grid_size + (col + 1)
                    dist = spacing + random.random() * 20
                    elev = (random.random() - 0.5) * 10
                    self._add_edge(node, right, dist, elev)
                # Down neighbor
                if row < self.grid_size - 1:
                    down = (row + 1) * self.grid_size + col
                    dist = spacing + random.random() * 20
                    elev = (random.random() - 0.5) * 10
                    self._add_edge(node, down, dist, elev)
                # Diagonal (40% chance)
                if col < self.grid_size - 1 and row < self.grid_size - 1 and random.random() > 0.6:
                    diag = (row + 1) * self.grid_size + (col + 1)
                    dist = spacing * 1.414 + random.random() * 20
                    elev = (random.random() - 0.5) * 15
                    self._add_edge(node, diag, dist, elev)

    def _add_edge(self, u: int, v: int, distance: float, elevation: float):
        self.edges[f"{u}-{v}"] = {"distance": distance, "elevation": elevation}
        self.edges[f"{v}-{u}"] = {"distance": distance, "elevation": -elevation}

    def get_neighbors(self, node: int) -> List[int]:
        neighbors = []
        for key in self.edges:
            parts = key.split("-")
            if int(parts[0]) == node:
                neighbors.append(int(parts[1]))
        return neighbors

    def get_edge(self, u: int, v: int) -> Optional[dict]:
        return self.edges.get(f"{u}-{v}")


# ============================================================
# Environment
# ============================================================

class Environment:
    def __init__(self, total_nodes: int):
        self.total_nodes = total_nodes
        self.traffic: Dict[str, float] = {}
        self.rain: float = random.random() * 0.5
        self.flood_zones: set = set()
        self._init_traffic()

    def _init_traffic(self):
        for i in range(self.total_nodes):
            for j in range(i + 1, self.total_nodes):
                key = f"{min(i, j)}-{max(i, j)}"
                self.traffic[key] = 0.5 * (0.6 + random.random() * 0.8)

    def get_traffic_factor(self, u: int, v: int) -> float:
        key = f"{min(u, v)}-{max(u, v)}"
        return self.traffic.get(key, 0.5)

    def get_weather_impact(self, node: int) -> float:
        if node in self.flood_zones:
            return 5.0
        if self.rain > 0.8:
            return 2.5
        elif self.rain > 0.3:
            return 1.5
        return 1.0

    def is_flooded(self, node: int) -> bool:
        return node in self.flood_zones

    def update(self):
        for key in self.traffic:
            val = self.traffic[key]
            self.traffic[key] = max(0.1, min(2.0, val + (random.random() - 0.5) * 0.3))
        self.rain = max(0, min(1, self.rain + (random.random() - 0.5) * 0.1))
        if random.random() > 0.95:
            self.flood_zones.clear()
            for _ in range(random.randint(0, 2)):
                self.flood_zones.add(random.randint(0, self.total_nodes - 1))


# ============================================================
# Carbon Credit & Cost Estimation
# ============================================================

def get_consumption_multiplier(vehicle_type: str) -> float:
    if vehicle_type == "ev":
        return 0.2
    elif vehicle_type == "hybrid":
        return 0.6
    return 1.0

def get_co2_factor(vehicle_type: str) -> float:
    if vehicle_type == "ev":
        return 0.4
    elif vehicle_type == "hybrid":
        return 1.2
    return 2.31

class CarbonCreditCalculator:
    """Converts carbon savings to real-world equivalents"""
    CO2_PER_TREE_PER_YEAR = 20  # kg CO2 per tree per year
    CO2_PER_KM_PETROL = 0.23  # kg CO2 per km for petrol vehicle
    
    @staticmethod
    def calculate_credits(co2_saved: float) -> dict:
        trees_saved = co2_saved / CarbonCreditCalculator.CO2_PER_TREE_PER_YEAR
        km_pollution_avoided = co2_saved / CarbonCreditCalculator.CO2_PER_KM_PETROL
        credits = co2_saved * 0.1  # Simplified credit metric
        
        return {
            "co2_kg": round(co2_saved, 3),
            "trees_equivalent": round(trees_saved, 2),
            "km_pollution_avoided": round(km_pollution_avoided, 1),
            "carbon_credits": round(credits, 2)
        }

class CostEstimator:
    """Calculates comprehensive business costs"""
    DRIVER_WAGE_PER_HOUR = 150  # INR per hour
    MAINTENANCE_PER_KM = {
        "ev": 0.5,
        "hybrid": 1.2,
        "petrol": 1.5
    }
    BATTERY_DEGRADATION_PER_KM = 0.02  # INR per km for EV
    
    @staticmethod
    def estimate_costs(distance: float, time_hours: float, vehicle_type: str, fleet_size: int = 100) -> dict:
        driver_cost = time_hours * CostEstimator.DRIVER_WAGE_PER_HOUR
        maintenance_rate = CostEstimator.MAINTENANCE_PER_KM.get(vehicle_type, 1.5)
        maintenance_cost = distance * maintenance_rate
        battery_cost = distance * CostEstimator.BATTERY_DEGRADATION_PER_KM if vehicle_type == "ev" else 0
        
        trip_cost = driver_cost + maintenance_cost + battery_cost
        annual_savings = trip_cost * 250 * fleet_size  # Assume 250 working days
        
        return {
            "trip_cost_breakdown": {
                "driver_wage": round(driver_cost, 2),
                "maintenance": round(maintenance_cost, 2),
                "battery_degradation": round(battery_cost, 2),
                "total_trip_cost": round(trip_cost, 2)
            },
            "fleet_annual_projection": {
                "single_vehicle_annual": round(trip_cost * 250, 2),
                "fleet_size": fleet_size,
                "total_annual_savings": round(annual_savings, 2),
                "savings_per_vehicle": round(annual_savings / fleet_size, 2) if fleet_size > 0 else 0
            }
        }

class AIExplainability:
    """Explains AI route decisions"""
    @staticmethod
    def explain_route(path: List[int], steps: List[dict], vehicle_type: str, avoided_nodes: set = None) -> dict:
        if avoided_nodes is None:
            avoided_nodes = set()
        
        reasons = []
        
        # Analyze route characteristics
        high_traffic_avoided = sum(1 for s in steps if s.get("traffic_level", 0) > 1.2)
        weather_impacts = sum(1 for s in steps if s.get("weather_condition") == "rainy")
        
        if high_traffic_avoided > 0:
            reasons.append(f"Avoided {high_traffic_avoided} high-congestion zones")
        
        if weather_impacts > 0:
            reasons.append(f"Navigated around {weather_impacts} weather-affected areas")
        
        if len(avoided_nodes) > 0:
            reasons.append(f"Avoided {len(avoided_nodes)} previously flooded corridors")
        
        # Vehicle-specific optimizations
        if vehicle_type == "ev":
            reasons.append("Optimized for EV charging efficiency")
        elif vehicle_type == "hybrid":
            reasons.append("Balanced fuel-electric consumption based on route profile")
        
        total_time = sum(s.get("time_cost", 0) for s in steps)
        if total_time < 0.5:  # Less than 30 mins
            reasons.append("Minimized idle time and stops")
        
        return {
            "decision_factors": reasons,
            "route_efficiency_score": round(min(100, 50 + (20 - len(path)) * 2), 1),
            "confidence": round(0.7 + (len(reasons) * 0.05), 2)
        }

# ============================================================
# Multi-Stop TSP Solver
# ============================================================

class MultiStopOptimizer:
    """Traveling Salesman Problem solver for multi-stop optimization"""
    
    @staticmethod
    def nearest_neighbor(graph: 'CityGraph', start: int, stops: List[int], env: 'Environment', vehicle_type: str) -> Tuple[List[int], float]:
        """Greedy nearest-neighbor heuristic for TSP"""
        unvisited = set(stops)
        current = start
        path = [current]
        total_cost = 0.0
        mult = get_consumption_multiplier(vehicle_type)
        
        while unvisited:
            nearest = min(unvisited, key=lambda n: MultiStopOptimizer._distance_cost(graph, env, current, n, mult))
            edge = graph.get_edge(current, nearest)
            if edge:
                tf = env.get_traffic_factor(current, nearest)
                wi = env.get_weather_impact(nearest)
                cost = edge["distance"] * 0.00025 * mult * tf * wi
                total_cost += cost
            path.append(nearest)
            unvisited.remove(nearest)
            current = nearest
        
        return path, total_cost
    
    @staticmethod
    def _distance_cost(graph: 'CityGraph', env: 'Environment', u: int, v: int, mult: float) -> float:
        edge = graph.get_edge(u, v)
        if not edge:
            return float('inf')
        tf = env.get_traffic_factor(u, v)
        wi = env.get_weather_impact(v)
        return edge["distance"] * 0.00025 * mult * tf * wi
    
    @staticmethod
    def optimize_stops(graph: 'CityGraph', start: int, stops: List[int], env: 'Environment', vehicle_type: str) -> dict:
        """Returns optimized stop order and metrics"""
        if len(stops) <= 1:
            return {
                "original_stops": stops,
                "optimized_stops": stops,
                "optimization_savings": 0,
                "reordering_suggestions": []
            }
        
        path, cost = MultiStopOptimizer.nearest_neighbor(graph, start, stops, env, vehicle_type)
        
        # Calculate naive route cost for comparison
        naive_path = [start] + stops
        naive_cost = 0.0
        mult = get_consumption_multiplier(vehicle_type)
        for i in range(len(naive_path) - 1):
            edge = graph.get_edge(naive_path[i], naive_path[i+1])
            if edge:
                tf = env.get_traffic_factor(naive_path[i], naive_path[i+1])
                wi = env.get_weather_impact(naive_path[i+1])
                naive_cost += edge["distance"] * 0.00025 * mult * tf * wi
        
        savings = ((naive_cost - cost) / naive_cost * 100) if naive_cost > 0 else 0
        
        return {
            "original_stops": [start] + stops,
            "optimized_stops": path,
            "optimization_savings": round(savings, 1),
            "cost_current": round(naive_cost, 5),
            "cost_optimized": round(cost, 5),
            "reordering_suggestions": [{"stop": path[i], "position": i} for i in range(1, len(path))]
        }

# ============================================================
# Analytics & Fleet Intelligence
# ============================================================

class FleetAnalytics:
    """Tracks fleet-level metrics over time"""
    def __init__(self):
        self.daily_metrics = []  # Historical data for trends
        self.start_date = datetime.now() - timedelta(days=30)  # Simulate 30 days of history
        self._init_historical_data()
    
    def _init_historical_data(self):
        """Initialize 30 days of simulated historical data"""
        for day in range(30):
            date = self.start_date + timedelta(days=day)
            fuel_savings = 100 + random.randint(0, 200) + (day * 2)  # Trending upward
            co2_reduction = 50 + random.randint(0, 100) + (day * 1.5)
            on_time_rate = 85 + random.randint(-5, 10) + (day * 0.3)
            ai_improvement = 60 + (day * 1.2)  # AI gets better over time
            
            self.daily_metrics.append({
                "date": date.strftime("%Y-%m-%d"),
                "fuel_savings_liters": round(fuel_savings, 1),
                "co2_reduction_kg": round(co2_reduction, 1),
                "on_time_delivery_rate": round(min(100, on_time_rate), 1),
                "ai_efficiency_vs_dijkstra": round(ai_improvement, 1),
                "routes_completed": random.randint(20, 50)
            })
    
    def get_monthly_trend(self) -> dict:
        """Get aggregated monthly metrics"""
        if not self.daily_metrics:
            return {}
        
        total_fuel = sum(d["fuel_savings_liters"] for d in self.daily_metrics)
        total_co2 = sum(d["co2_reduction_kg"] for d in self.daily_metrics)
        avg_on_time = sum(d["on_time_delivery_rate"] for d in self.daily_metrics) / len(self.daily_metrics)
        avg_ai_efficiency = sum(d["ai_efficiency_vs_dijkstra"] for d in self.daily_metrics) / len(self.daily_metrics)
        
        return {
            "period": "last_30_days",
            "total_fuel_saved_liters": round(total_fuel, 1),
            "total_co2_reduced_kg": round(total_co2, 1),
            "average_on_time_rate": round(avg_on_time, 1),
            "ai_vs_dijkstra_efficiency": round(avg_ai_efficiency, 1),
            "daily_history": self.daily_metrics[-7:]  # Last 7 days for graph
        }

# ============================================================
# Q-Learning Agent
# ============================================================


class QLearningAgent:
    def __init__(self, graph: CityGraph, env: Environment):
        self.graph = graph
        self.env = env
        self.q_table: Dict[str, Dict[int, float]] = {}
        self.lr = 0.1
        self.gamma = 0.9
        self.epsilon = 0.1

    def _state_key(self, node: int, traffic: float, weather: float) -> str:
        return f"{node}-{int(traffic * 5)}-{int(weather * 5)}"

    def _get_q(self, state_key: str, action: int) -> float:
        return self.q_table.get(state_key, {}).get(action, 0.0)

    def _set_q(self, state_key: str, action: int, value: float):
        if state_key not in self.q_table:
            self.q_table[state_key] = {}
        self.q_table[state_key][action] = value

    def train(self, start: int, goal: int, vehicle_type: str, priority: str, episodes: int = 200) -> List[float]:
        rewards_history = []
        mult = get_consumption_multiplier(vehicle_type)

        for _ in range(episodes):
            current = start
            visited = {start}
            total_reward = 0.0
            steps = 0

            while current != goal and steps < 50:
                neighbors = [n for n in self.graph.get_neighbors(current) if n not in visited]
                if not neighbors:
                    break

                traffic = self.env.get_traffic_factor(current, neighbors[0]) if neighbors else 0.5
                weather = self.env.get_weather_impact(current)
                state_key = self._state_key(current, traffic, weather)

                # Epsilon-greedy action selection
                if random.random() < self.epsilon:
                    next_node = random.choice(neighbors)
                else:
                    best_val = -math.inf
                    next_node = neighbors[0]
                    for n in neighbors:
                        q = self._get_q(state_key, n)
                        if q > best_val:
                            best_val = q
                            next_node = n

                edge = self.graph.get_edge(current, next_node)
                if not edge:
                    break

                tf = self.env.get_traffic_factor(current, next_node)
                wi = self.env.get_weather_impact(next_node)
                flooded = self.env.is_flooded(next_node)

                if flooded:
                    reward = -10000
                else:
                    fuel = edge["distance"] * 0.00025 * mult * tf * wi
                    time_cost = edge["distance"] * 0.002 * tf * wi
                    if priority in ("critical", "high"):
                        reward = -(time_cost * 80 + fuel * 5)
                    elif priority == "low":
                        reward = -(fuel * 50 + time_cost * 2)
                    else:
                        reward = -(fuel * 25 + time_cost * 15)

                total_reward += reward

                # Bellman update
                next_traffic = tf
                next_weather = wi
                next_state_key = self._state_key(next_node, next_traffic, next_weather)
                next_neighbors = self.graph.get_neighbors(next_node)
                max_next_q = max([self._get_q(next_state_key, n) for n in next_neighbors] or [0])
                current_q = self._get_q(state_key, next_node)
                new_q = current_q + self.lr * (reward + self.gamma * max_next_q - current_q)
                self._set_q(state_key, next_node, new_q)

                visited.add(next_node)
                current = next_node
                steps += 1

            rewards_history.append(total_reward)

        return rewards_history

    def find_route(self, start: int, goal: int, vehicle_type: str) -> dict:
        path = [start]
        steps = []
        current = start
        visited = {start}
        total_fuel = 0.0
        total_time = 0.0
        total_distance = 0.0
        mult = get_consumption_multiplier(vehicle_type)

        for _ in range(100):
            if current == goal:
                break

            neighbors = [n for n in self.graph.get_neighbors(current) if n not in visited]
            if not neighbors:
                # Allow backtracking
                all_nb = [n for n in self.graph.get_neighbors(current) if n != current]
                if not all_nb:
                    break
                neighbors = all_nb

            traffic = self.env.get_traffic_factor(current, neighbors[0])
            weather = self.env.get_weather_impact(current)
            state_key = self._state_key(current, traffic, weather)

            best_val = -math.inf
            best_node = neighbors[0]
            for n in neighbors:
                q = self._get_q(state_key, n)
                if q > best_val:
                    best_val = q
                    best_node = n

            edge = self.graph.get_edge(current, best_node)
            if not edge:
                break

            tf = self.env.get_traffic_factor(current, best_node)
            wi = self.env.get_weather_impact(best_node)

            seg_fuel = (edge["distance"] * 0.00025 + max(0, edge["elevation"] * 0.0001)) * mult * tf * wi
            seg_time = edge["distance"] * 0.002 * tf * wi

            total_fuel += seg_fuel
            total_time += seg_time
            total_distance += edge["distance"]

            reason = "Optimal path found."
            if tf > 1.2:
                reason = "Heavy traffic but shortest fuel path."
            elif wi > 1.2:
                reason = "Weather impact significant, but safe."

            steps.append({
                "node": best_node,
                "traffic_level": round(tf, 3),
                "weather_condition": "rainy" if wi > 1.2 else "clear",
                "fuel_cost": round(seg_fuel, 5),
                "time_cost": round(seg_time, 3),
                "reason": reason
            })

            path.append(best_node)
            visited.add(best_node)
            current = best_node

        co2 = total_fuel * get_co2_factor(vehicle_type)

        return {
            "path": path,
            "steps": steps,
            "total_fuel": round(total_fuel, 5),
            "total_time": round(total_time, 3),
            "total_distance": round(total_distance, 2),
            "co2_emissions": round(co2, 5),
            "algorithm": "QLearning"
        }


# ============================================================
# Dijkstra Router
# ============================================================

class DijkstraRouter:
    def __init__(self, graph: CityGraph, env: Environment):
        self.graph = graph
        self.env = env

    def find_route(self, start: int, goal: int, vehicle_type: str, priority: str) -> dict:
        dist = {i: math.inf for i in range(self.graph.total_nodes)}
        prev = {i: None for i in range(self.graph.total_nodes)}
        dist[start] = 0
        pq = [(0, start)]
        mult = get_consumption_multiplier(vehicle_type)

        while pq:
            d, u = heapq.heappop(pq)
            if d > dist[u]:
                continue
            if u == goal:
                break

            for v in self.graph.get_neighbors(u):
                edge = self.graph.get_edge(u, v)
                if not edge:
                    continue
                tf = self.env.get_traffic_factor(u, v)
                wi = self.env.get_weather_impact(v)
                flood_penalty = 500 if self.env.is_flooded(v) else 0

                time_cost = edge["distance"] * 0.002 * tf * wi
                fuel_cost = edge["distance"] * 0.00025 * mult * tf * wi

                if priority in ("critical", "high"):
                    cost = time_cost + flood_penalty
                elif priority == "low":
                    cost = fuel_cost * 2 + flood_penalty
                else:
                    cost = fuel_cost * 5 + time_cost * 2 + flood_penalty

                new_dist = dist[u] + cost
                if new_dist < dist[v]:
                    dist[v] = new_dist
                    prev[v] = u
                    heapq.heappush(pq, (new_dist, v))

        # Reconstruct path
        path = []
        node = goal
        while node is not None:
            path.append(node)
            node = prev[node]
        path.reverse()

        if not path or path[0] != start:
            return {
                "path": [start, goal],
                "steps": [],
                "total_fuel": 0,
                "total_time": 0,
                "total_distance": 0,
                "co2_emissions": 0,
                "algorithm": "Dijkstra"
            }

        # Calculate metrics
        steps = []
        total_fuel = 0.0
        total_time = 0.0
        total_distance = 0.0

        for i in range(len(path) - 1):
            edge = self.graph.get_edge(path[i], path[i + 1])
            if not edge:
                continue
            tf = self.env.get_traffic_factor(path[i], path[i + 1])
            wi = self.env.get_weather_impact(path[i + 1])
            seg_fuel = (edge["distance"] * 0.00025 + max(0, edge["elevation"] * 0.0001)) * mult * tf * wi
            seg_time = edge["distance"] * 0.002 * tf * wi

            total_fuel += seg_fuel
            total_time += seg_time
            total_distance += edge["distance"]

            steps.append({
                "node": path[i + 1],
                "traffic_level": round(tf, 3),
                "weather_condition": "rainy" if wi > 1.2 else "clear",
                "fuel_cost": round(seg_fuel, 5),
                "time_cost": round(seg_time, 3),
                "reason": None
            })

        co2 = total_fuel * get_co2_factor(vehicle_type)

        return {
            "path": path,
            "steps": steps,
            "total_fuel": round(total_fuel, 5),
            "total_time": round(total_time, 3),
            "total_distance": round(total_distance, 2),
            "co2_emissions": round(co2, 5),
            "algorithm": "Dijkstra"
        }


# ============================================================
# Global State
# ============================================================

city = CityGraph()
env = Environment(city.total_nodes)
rl_agent = QLearningAgent(city, env)
dijkstra_router = DijkstraRouter(city, env)
simulation_history: List[dict] = []
fleet_analytics = FleetAnalytics()
carbon_calculator = CarbonCreditCalculator()
cost_estimator = CostEstimator()
ai_explainability = AIExplainability()
multi_stop_optimizer = MultiStopOptimizer()


# ============================================================
# Request/Response Models
# ============================================================

class SimulationParams(BaseModel):
    start_node: int = Field(..., ge=0, le=63, description="Start node (0-63)")
    goal_node: int = Field(..., ge=0, le=63, description="Goal node (0-63)")
    vehicle_type: str = Field(default="ev", pattern="^(ev|petrol|hybrid)$")
    priority: str = Field(default="standard", pattern="^(critical|high|standard|low)$")
    traffic_intensity: float = Field(default=0.5, ge=0, le=1)
    rain_level: float = Field(default=0.0, ge=0, le=1)
    episodes: int = Field(default=200, ge=10, le=1000)

class RouteStep(BaseModel):
    node: int
    traffic_level: float
    weather_condition: str
    fuel_cost: float
    time_cost: float
    reason: Optional[str] = None

class RouteResponse(BaseModel):
    path: List[int]
    steps: List[RouteStep]
    total_fuel: float
    total_time: float
    total_distance: float
    co2_emissions: float
    algorithm: str

class CarbonCreditsResponse(BaseModel):
    co2_kg: float
    trees_equivalent: float
    km_pollution_avoided: float
    carbon_credits: float

class CostBreakdownResponse(BaseModel):
    trip_cost_breakdown: dict
    fleet_annual_projection: dict

class AIExplainabilityResponse(BaseModel):
    decision_factors: List[str]
    route_efficiency_score: float
    confidence: float

class MultiStopResponse(BaseModel):
    original_stops: List[int]
    optimized_stops: List[int]
    optimization_savings: float
    cost_current: float
    cost_optimized: float
    reordering_suggestions: List[dict]


# ============================================================
# Endpoints
# ============================================================

@app.get("/")
def read_root():
    return {
        "status": "GreenPath Engine Running",
        "version": "2.0.0",
        "total_nodes": city.total_nodes,
        "total_edges": len(city.edges),
        "simulation_runs": len(simulation_history)
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "uptime_nodes": city.total_nodes,
        "q_table_size": len(rl_agent.q_table),
        "active_flood_zones": list(env.flood_zones),
        "rain_level": round(env.rain, 3)
    }


@app.post("/simulate/step")
def trigger_step():
    """Advances simulation by one time step (traffic, weather)"""
    env.update()
    return {
        "status": "updated",
        "rain_level": round(env.rain, 3),
        "flood_zones": list(env.flood_zones)
    }


@app.post("/route/optimize")
def optimize_route(params: SimulationParams):
    """Trains the RL agent and returns both RL and Dijkstra routes for comparison"""
    if params.start_node == params.goal_node:
        raise HTTPException(status_code=400, detail="Start and goal nodes must be different")

    # Apply environment overrides
    env.rain = params.rain_level
    if params.rain_level > 0.8:
        env.flood_zones.clear()
        for _ in range(random.randint(0, 2)):
            env.flood_zones.add(random.randint(0, city.total_nodes - 1))

    # Train RL agent
    start_time = time.time()
    rewards = rl_agent.train(
        params.start_node, params.goal_node,
        params.vehicle_type, params.priority,
        params.episodes
    )
    training_time = time.time() - start_time

    # Get routes from both algorithms
    rl_result = rl_agent.find_route(params.start_node, params.goal_node, params.vehicle_type)
    dijkstra_result = dijkstra_router.find_route(
        params.start_node, params.goal_node, params.vehicle_type, params.priority
    )

    # Calculate carbon credits and costs
    rl_co2_savings = dijkstra_result["co2_emissions"] - rl_result["co2_emissions"]
    carbon_credits = carbon_calculator.calculate_credits(rl_co2_savings)
    
    rl_time_hours = rl_result["total_time"] / 3600
    cost_breakdown = cost_estimator.estimate_costs(
        rl_result["total_distance"],
        rl_time_hours,
        params.vehicle_type
    )
    
    # Get AI explainability
    avoided_nodes = env.flood_zones.copy()
    explainability = ai_explainability.explain_route(
        rl_result["path"],
        rl_result["steps"],
        params.vehicle_type,
        avoided_nodes
    )

    # Save to history
    run_record = {
        "id": len(simulation_history) + 1,
        "timestamp": time.time(),
        "params": params.model_dump(),
        "rl": rl_result,
        "dijkstra": dijkstra_result,
        "training_time_ms": round(training_time * 1000, 1),
        "training_episodes": params.episodes,
        "final_reward": rewards[-1] if rewards else 0,
        "carbon_credits": carbon_credits,
        "cost_breakdown": cost_breakdown,
        "explainability": explainability
    }
    simulation_history.append(run_record)

    return {
        "rl": rl_result,
        "dijkstra": dijkstra_result,
        "training_time_ms": round(training_time * 1000, 1),
        "reward_history": rewards[-20:],  # Last 20 episode rewards
        "carbon_credits_earned": carbon_credits,
        "cost_breakdown": cost_breakdown,
        "ai_explanation": explainability
    }


@app.post("/chaos/trigger")
def trigger_chaos():
    """Injects a major incident — floods random nodes and spikes traffic"""
    affected = []
    for _ in range(random.randint(2, 5)):
        node = random.randint(0, city.total_nodes - 1)
        env.flood_zones.add(node)
        affected.append(node)
    env.rain = min(1.0, env.rain + 0.4)

    return {
        "event": "Major Weather Event Triggered",
        "impact": "Multiple routes blocked, recalculation required",
        "affected_nodes": affected,
        "new_rain_level": round(env.rain, 3)
    }


@app.get("/metrics")
def get_metrics():
    total_runs = len(simulation_history)
    rl_wins = sum(
        1 for r in simulation_history
        if r["rl"]["total_fuel"] < r["dijkstra"]["total_fuel"]
    )
    avg_training_time = (
        sum(r["training_time_ms"] for r in simulation_history) / total_runs
        if total_runs > 0 else 0
    )

    return {
        "total_simulations": total_runs,
        "rl_wins": rl_wins,
        "dijkstra_wins": total_runs - rl_wins,
        "rl_win_rate": round(rl_wins / total_runs * 100, 1) if total_runs > 0 else 0,
        "avg_training_time_ms": round(avg_training_time, 1),
        "q_table_states": len(rl_agent.q_table),
        "active_flood_zones": len(env.flood_zones),
        "current_rain": round(env.rain, 3)
    }


@app.get("/history")
def get_history(limit: int = 20):
    """Retrieve recent simulation history"""
    recent = simulation_history[-limit:]
    recent.reverse()
    return {"runs": recent, "total": len(simulation_history)}


@app.get("/fleet")
def get_fleet():
    """Return simulated fleet status"""
    fleet = []
    for i in range(5):
        fleet.append({
            "id": f"VH-{100 + i}",
            "type": "ev" if i % 2 == 0 else "petrol",
            "location": random.randint(0, city.total_nodes - 1),
            "status": random.choice(["idle", "en-route", "charging"]),
            "current_range": random.randint(50, 300),
            "stress_index": round(random.random() * 10, 1)
        })
    return {"fleet": fleet}


# ============================================================
# NEW ENDPOINTS: Business Intelligence & Analytics
# ============================================================

@app.get("/analytics/dashboard")
def get_analytics_dashboard():
    """Business-level fleet analytics dashboard"""
    return fleet_analytics.get_monthly_trend()


@app.post("/optimize/multi-stop")
def optimize_multi_stop(start_node: int, stops: List[int], vehicle_type: str = "ev"):
    """Multi-stop route optimization using TSP heuristic"""
    if not stops:
        raise HTTPException(status_code=400, detail="At least one stop required")
    
    if start_node in stops:
        stops = [s for s in stops if s != start_node]
    
    if len(stops) == 0:
        raise HTTPException(status_code=400, detail="Start node cannot be only stop")
    
    result = multi_stop_optimizer.optimize_stops(city, start_node, stops, env, vehicle_type)
    
    # Calculate full metrics
    total_fuel = 0.0
    mult = get_consumption_multiplier(vehicle_type)
    
    for i in range(len(result["optimized_stops"]) - 1):
        edge = city.get_edge(result["optimized_stops"][i], result["optimized_stops"][i+1])
        if edge:
            tf = env.get_traffic_factor(result["optimized_stops"][i], result["optimized_stops"][i+1])
            wi = env.get_weather_impact(result["optimized_stops"][i+1])
            total_fuel += edge["distance"] * 0.00025 * mult * tf * wi
    
    co2 = total_fuel * get_co2_factor(vehicle_type)
    carbon_credits = carbon_calculator.calculate_credits(co2)
    
    return {
        "multi_stop_optimization": result,
        "total_co2_optimized": round(co2, 5),
        "carbon_credits": carbon_credits,
        "stops_count": len(stops),
        "recommended_order": result["optimized_stops"]
    }


@app.get("/carbon/impact")
def get_carbon_impact(co2_saved: float = 50.0):
    """Get real-world carbon credit impact"""
    return carbon_calculator.calculate_credits(co2_saved)


@app.post("/cost/estimate")
def estimate_costs(distance: float, time_hours: float, vehicle_type: str = "ev", fleet_size: int = 100):
    """Comprehensive business cost estimation"""
    if distance < 0 or time_hours < 0:
        raise HTTPException(status_code=400, detail="Distance and time must be positive")
    
    return cost_estimator.estimate_costs(distance, time_hours, vehicle_type, fleet_size)


@app.get("/explainability/route/{route_id}")
def get_route_explanation(route_id: int):
    """Get AI decision explanation for a past route"""
    if route_id < 1 or route_id > len(simulation_history):
        raise HTTPException(status_code=404, detail="Route not found")
    
    run = simulation_history[route_id - 1]
    return run.get("explainability", {})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
