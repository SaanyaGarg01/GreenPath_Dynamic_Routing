// Mock Supabase implementation - not using external service
// Keeping the interface compatible for potential future use

// Mock supabase client
export const supabase = {
  auth: {
    signUp: async (_credentials: any) => ({ data: null, error: null }),
    signInWithPassword: async (_credentials: any) => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null })
  },
  from: (_table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: (_data: any) => ({ data: null, error: null }),
    update: (_data: any) => ({ data: null, error: null }),
    delete: () => ({ error: null })
  })
};


export interface CityNode {
  id: string;
  node_id: number;
  x: number;
  y: number;
  name: string;
}

export interface RoadEdge {
  id: string;
  from_node: number;
  to_node: number;
  distance: number;
  base_elevation: number;
}

export interface SimulationRun {
  algorithm: string;
  start_node: number;
  end_node: number;
  priority: string;
  total_fuel: number;
  total_time: number;
  total_distance: number;
  co2_emissions: number;
  route_path: number[];
  traffic_conditions: Record<string, number>;
  weather_conditions: Record<string, number>;
}
