import { create } from 'zustand'

export interface GridNode {
  id: string
  name: string
  type: 'generator' | 'load' | 'substation' | 'transformer'
  x: number
  y: number
  status: 'online' | 'offline' | 'maintenance' | 'warning'
  capacity: number
  currentLoad: number
  voltage: number
  frequency: number
  temperature?: number
  efficiency?: number
  lastMaintenance?: Date
  nextMaintenance?: Date
}

export interface GridConnection {
  id: string
  from: string
  to: string
  capacity: number
  currentFlow: number
  voltage: number
  status: 'active' | 'inactive' | 'overload' | 'maintenance'
  impedance: number
  losses: number
}

export interface GridMetrics {
  totalGeneration: number
  totalLoad: number
  efficiency: number
  frequency: number
  voltage: number
  powerFactor: number
  losses: number
  reliability: number
  co2Emissions: number
  operatingCost: number
  peakDemand: number
  demandResponse: number
}

export interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  timestamp: Date
  nodeId?: string
  acknowledged: boolean
  resolved: boolean
}

interface GridState {
  nodes: GridNode[]
  connections: GridConnection[]
  metrics: GridMetrics
  alerts: Alert[]
  selectedNode: string | null
  isLoading: boolean
  lastUpdate: Date | null
  
  // Actions
  setNodes: (nodes: GridNode[]) => void
  setConnections: (connections: GridConnection[]) => void
  updateMetrics: (metrics: Partial<GridMetrics>) => void
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void
  acknowledgeAlert: (alertId: string) => void
  resolveAlert: (alertId: string) => void
  selectNode: (nodeId: string | null) => void
  updateNode: (nodeId: string, updates: Partial<GridNode>) => void
  updateConnection: (connectionId: string, updates: Partial<GridConnection>) => void
  setLoading: (loading: boolean) => void
  refresh: () => void
}

export const useGridStore = create<GridState>((set, get) => ({
  nodes: [],
  connections: [],
  metrics: {
    totalGeneration: 0,
    totalLoad: 0,
    efficiency: 0,
    frequency: 50,
    voltage: 400,
    powerFactor: 0.95,
    losses: 0,
    reliability: 99.9,
    co2Emissions: 0,
    operatingCost: 0,
    peakDemand: 0,
    demandResponse: 0,
  },
  alerts: [],
  selectedNode: null,
  isLoading: false,
  lastUpdate: null,

  setNodes: (nodes) => set({ nodes, lastUpdate: new Date() }),
  setConnections: (connections) => set({ connections, lastUpdate: new Date() }),
  updateMetrics: (metrics) => set(state => ({ 
    metrics: { ...state.metrics, ...metrics },
    lastUpdate: new Date()
  })),
  addAlert: (alert) => set(state => ({
    alerts: [{
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
    }, ...state.alerts]
  })),
  acknowledgeAlert: (alertId) => set(state => ({
    alerts: state.alerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    )
  })),
  resolveAlert: (alertId) => set(state => ({
    alerts: state.alerts.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    )
  })),
  selectNode: (nodeId) => set({ selectedNode: nodeId }),
  updateNode: (nodeId, updates) => set(state => ({
    nodes: state.nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    ),
    lastUpdate: new Date()
  })),
  updateConnection: (connectionId, updates) => set(state => ({
    connections: state.connections.map(connection =>
      connection.id === connectionId ? { ...connection, ...updates } : connection
    ),
    lastUpdate: new Date()
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  refresh: () => {
    // This would typically trigger a data fetch
    set({ lastUpdate: new Date() })
  },
}))